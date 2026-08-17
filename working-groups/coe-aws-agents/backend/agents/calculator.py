"""Calculator Agent — creates AWS cost estimates via conversation."""
import os
import json
from typing import AsyncGenerator

from strands import Agent, tool
from strands.models import BedrockModel

from tools.aws_calculator_client import load_manifest, search_services as _search_services, fetch_service_definition, extract_input_fields, enrich_fields_with_metadata, find_service, fetch_estimate, estimate_to_markdown
from tools.estimate_builder import EstimateBuilder


MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-6")

SYSTEM_PROMPT = """You are an AWS Pricing Calculator assistant. You ONLY create and modify AWS cost estimates.

GUARDRAILS:
- REFUSE any request not directly related to AWS cost estimation.
- If asked something off-topic, reply only: "I can only help with AWS cost estimates. Describe the services you'd like to estimate."

Workflow:
1. Understand what services the user needs
2. If region not specified, ask briefly
3. Search services, get fields, create estimate, add services, export
4. After export, reply with a brief summary of what was configured

Rules:
- Only call create_estimate ONCE per conversation. For updates, just add_service and re-export.
- Each export generates a NEW link with ALL services in the estimate.
- Always include "region" and "description" in service configs.
- Descriptions must NOT contain <, >, or & characters.
- Use get_service_fields for field IDs (except EC2 which has special fields).
- Do NOT include the calculator.aws URL in your text — the UI displays it automatically as a card.

Response style:
- Be concise. Short sentences.
- Brief table or bullets for the summary.
- Match the user's language.
"""

# Session-level estimate builders (keyed by session_id)
_estimates: dict[str, EstimateBuilder] = {}


@tool
async def search_aws_services(query: str) -> str:
    """Search AWS services available in the calculator by name.

    Args:
        query: Search terms, comma-separated (e.g. "Lambda, S3, API Gateway")
    """
    manifest = await load_manifest()
    results = _search_services(manifest, query)
    return json.dumps(results, default=str)


@tool
async def get_service_fields(service: str) -> str:
    """Get input fields for AWS services. Returns field IDs, types, labels, and valid options.

    Args:
        service: Service keys, comma-separated (e.g. "aWSLambda, amazonS3")
    """
    keys = [s.strip() for s in service.split(",")]
    manifest = await load_manifest()
    results = []
    for key in keys:
        svc = find_service(manifest, key)
        if not svc:
            results.append({"serviceCode": key, "error": "Not found"})
            continue
        definition = await fetch_service_definition(manifest, svc["key"])
        fields = extract_input_fields(definition)
        enriched = await enrich_fields_with_metadata(definition, fields)
        results.append({"serviceCode": svc["key"], "serviceName": svc.get("name"), "fields": enriched})
    return json.dumps(results, default=str)


@tool
def create_estimate(name: str = "My Estimate") -> str:
    """Create a new empty estimate. Must be called before adding services.

    Args:
        name: Name for the estimate
    """
    # Session ID is injected via invocation_state
    # For now use a global singleton per "conversation"
    global _current_session
    session_id = _current_session or "default"
    if session_id in _estimates:
        return json.dumps({"status": "already_exists", "message": "Estimate already exists. Use add_service to add more services."})
    _estimates[session_id] = EstimateBuilder(name)
    return json.dumps({"status": "created", "name": name})


@tool
async def add_service(services: str) -> str:
    """Add AWS services to the current estimate.

    Args:
        services: JSON array of service entries: [{"service":"key","group":"optional","config":{...}}]
    """
    global _current_session
    session_id = _current_session or "default"
    if session_id not in _estimates:
        _estimates[session_id] = EstimateBuilder("My Estimate")

    eb = _estimates[session_id]
    entries = json.loads(services)
    added = []
    for entry in entries:
        svc_key = entry.get("service")
        config = entry.get("config", {})
        group = entry.get("group")
        eb.add_service(svc_key, config, group)
        added.append({"service": svc_key, "description": config.get("description", "")})
    return json.dumps({"added": added, "totalServices": len(eb.services) + sum(len(g.get("services", {})) for g in eb.groups.values())})


@tool
async def export_estimate() -> str:
    """Export the current estimate to calculator.aws and get a shareable URL."""
    global _current_session
    session_id = _current_session or "default"
    if session_id not in _estimates:
        return json.dumps({"error": "No estimate created yet. Call create_estimate first."})
    eb = _estimates[session_id]
    result = await eb.export()
    return json.dumps(result)


@tool
async def import_estimate(estimate_id: str, format: str = "json") -> str:
    """Import an existing AWS Pricing Calculator estimate by URL or ID.

    Args:
        estimate_id: Estimate ID or full calculator.aws URL
        format: "json" or "markdown"
    """
    # Extract ID from URL if needed
    if "calculator.aws" in estimate_id:
        estimate_id = estimate_id.split("id=")[-1].split("&")[0]
    data = await fetch_estimate(estimate_id)
    if format == "markdown":
        return estimate_to_markdown(data)
    return json.dumps(data, default=str)


# Module-level variable to track current session
_current_session: str | None = None


async def run_calculator_agent(messages: list, session_id: str) -> AsyncGenerator[dict, None]:
    """Run the calculator agent and yield SSE events."""
    global _current_session
    _current_session = session_id

    model = BedrockModel(model_id=MODEL_ID)
    agent = Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[search_aws_services, get_service_fields, create_estimate, add_service, export_estimate, import_estimate],
    )

    # Get last user message
    last_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", [])
            if content and isinstance(content[0], dict) and "text" in content[0]:
                last_message = content[0]["text"]
            break

    # Run agent
    result = agent(last_message)
    response_text = str(result)

    # Emit tool call events based on which tools were used
    # Check if an export URL was generated
    if session_id in _estimates:
        eb = _estimates[session_id]
        # Check recent tool calls from the agent result
        for tool_name in ["search_aws_services", "get_service_fields", "create_estimate", "add_service", "export_estimate"]:
            if tool_name in response_text:
                yield {"type": "tool_call", "tool": tool_name.replace("search_aws_services", "search_services")}

    # Check for export URL in response
    if "calculator.aws" in response_text:
        import re
        url_match = re.search(r'https://calculator\.aws/#/estimate\?id=\w+', response_text)
        if url_match:
            yield {"type": "export_url", "url": url_match.group()}
            # Remove URL from text response
            response_text = response_text.replace(url_match.group(), "").strip()

    yield {"type": "response", "text": response_text}
