"""APN Agent — queries AWS Partner Central for opportunities and fundings."""
import os
import json
import hashlib
import time
from typing import AsyncGenerator

import boto3
import httpx
from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.credentials import Credentials

from strands import Agent, tool
from strands.models import BedrockModel


MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-6")
MCP_ENDPOINT = os.getenv("APN_MCP_ENDPOINT", "https://partnercentral-agents-mcp.us-east-1.api.aws")

APN_CREDENTIALS = None
_selling_client = None
_benefits_client = None


def _get_apn_credentials():
    global APN_CREDENTIALS
    if APN_CREDENTIALS is None:
        access_key = os.getenv("APN_ACCESS_KEY_ID")
        secret_key = os.getenv("APN_SECRET_ACCESS_KEY")
        if not access_key or not secret_key:
            raise RuntimeError("APN_ACCESS_KEY_ID and APN_SECRET_ACCESS_KEY must be set")
        APN_CREDENTIALS = Credentials(access_key, secret_key)
    return APN_CREDENTIALS


def _get_selling_client():
    global _selling_client
    if _selling_client is None:
        creds = _get_apn_credentials()
        _selling_client = boto3.client(
            "partnercentral-selling",
            region_name="us-east-1",
            aws_access_key_id=creds.access_key,
            aws_secret_access_key=creds.secret_key,
        )
    return _selling_client


def _get_benefits_client():
    global _benefits_client
    if _benefits_client is None:
        creds = _get_apn_credentials()
        _benefits_client = boto3.client(
            "partnercentral-benefits",
            region_name="us-east-1",
            aws_access_key_id=creds.access_key,
            aws_secret_access_key=creds.secret_key,
        )
    return _benefits_client


SYSTEM_PROMPT = """You are an AWS Partner Central assistant. You help users query and understand their APN opportunities and funding applications.

GUARDRAILS:
- ONLY help with Partner Central queries (opportunities, fundings, pipeline analysis).
- REFUSE any off-topic request: "I can only help with Partner Central queries."
- Never DELETE data. Create and update operations are allowed via MCP only.
- Never expose raw AWS credentials or internal IDs unnecessarily.
- Before creating or updating an opportunity, ALWAYS confirm the details with the user first.

CAPABILITIES:
- List opportunities (filter by stage/status)
- Get details of a specific opportunity
- Get the AWS-side view of an opportunity
- List funding/benefit applications
- Get funding application details
- Create new opportunities (via MCP)
- Update existing opportunities (via MCP)
- Advanced: sales plays, next steps, comparisons, pipeline analysis (via MCP)

TOOL SELECTION — CRITICAL:
- Use API tools (list_opportunities, get_opportunity, get_aws_opportunity_summary, list_funding_applications, get_funding_details) for SIMPLE data retrieval
- Use send_mcp_message for COMPLEX queries that need reasoning: comparisons, sales plays, next steps, pipeline analysis
- Use send_mcp_message for ALL create and update operations
- NEVER loop through 100 opportunities one by one. Use send_mcp_message instead.

RESPONSE STYLE:
- When listing, show EVERY item in a table. No summaries.
- Format: table with columns ID | Customer | Stage | Expected Spend
- Match the user's language.
"""


@tool
def list_opportunities(status: str = "", max_results: int = 20) -> str:
    """List opportunities from AWS Partner Central.

    Args:
        status: Filter by lifecycle stage (e.g. Prospect, Qualified, Technical Validation). Leave empty for all.
        max_results: Max results to return (default 20, max 100)
    """
    client = _get_selling_client()
    params = {"Catalog": "AWS", "MaxResults": min(max_results, 100)}
    if status:
        params["LifeCycleFilter"] = {"Stage": [status]}
    response = client.list_opportunities(**params)
    opportunities = []
    for opp in response.get("OpportunitySummaries", []):
        opportunities.append({
            "id": opp.get("Id"),
            "type": opp.get("OpportunityType"),
            "stage": opp.get("LifeCycle", {}).get("Stage"),
            "customerName": opp.get("Customer", {}).get("Account", {}).get("CompanyName"),
            "country": opp.get("Customer", {}).get("Account", {}).get("Address", {}).get("CountryCode"),
            "expectedSpend": opp.get("Project", {}).get("ExpectedCustomerSpend", [{}])[0].get("Amount"),
            "lastModified": str(opp.get("LastModifiedDate", "")),
        })
    return json.dumps({"count": len(opportunities), "opportunities": opportunities})


@tool
def get_opportunity(identifier: str) -> str:
    """Get full details of a specific opportunity by ID (e.g. O12345678).

    Args:
        identifier: Opportunity identifier (e.g. O12345678)
    """
    client = _get_selling_client()
    response = client.get_opportunity(Catalog="AWS", Identifier=identifier)
    return json.dumps({
        "id": response.get("Id") or response.get("Identifier"),
        "type": response.get("OpportunityType"),
        "stage": response.get("LifeCycle", {}).get("Stage"),
        "customer": response.get("Customer"),
        "project": response.get("Project"),
        "lifecycle": response.get("LifeCycle"),
    }, default=str)


@tool
def get_aws_opportunity_summary(identifier: str) -> str:
    """Get the AWS-side view of an opportunity.

    Args:
        identifier: Opportunity identifier (e.g. O12345678)
    """
    client = _get_selling_client()
    response = client.get_aws_opportunity_summary(Catalog="AWS", RelatedOpportunityIdentifier=identifier)
    return json.dumps(response, default=str)


@tool
def list_funding_applications(max_results: int = 20) -> str:
    """List all benefit/funding applications from Partner Central.

    Args:
        max_results: Max results (default 20)
    """
    client = _get_benefits_client()
    response = client.list_benefit_applications(Catalog="AWS", MaxResults=max_results)
    return json.dumps(response, default=str)


@tool
def get_funding_details(identifier: str) -> str:
    """Get full details of a funding/benefit application by ID.

    Args:
        identifier: Benefit application ID (e.g. benappl-xxxxx)
    """
    client = _get_benefits_client()
    response = client.get_benefit_application(Catalog="AWS", Identifier=identifier)
    details = response.get("BenefitApplicationDetails", {})
    return json.dumps({
        "id": response.get("Id"),
        "status": response.get("Status"),
        "stage": response.get("Stage"),
        "activityName": details.get("ActivityName"),
        "program": details.get("Program"),
        "plannedStartDate": str(details.get("PlannedStartDate", "")),
        "plannedEndDate": str(details.get("PlannedEndDate", "")),
        "requestedAmount": details.get("CashRequest", {}).get("RequestedAmountInUsd"),
        "annualRunRate": details.get("AnnualRunRate"),
        "calculatorUrl": (details.get("AwsCalculatorUrls") or [None])[0],
        "businessDescription": (details.get("BusinessDescription") or "")[:500],
    }, default=str)


@tool
async def send_mcp_message(message: str, session_id: str = "") -> str:
    """Send a message to the Partner Central MCP Agent for advanced operations.

    Args:
        message: Natural language message (e.g. "generate a sales play for opportunity O12345")
        session_id: Optional session ID for multi-turn conversations
    """
    creds = _get_apn_credentials()
    body = json.dumps({
        "jsonrpc": "2.0",
        "id": str(int(time.time() * 1000)),
        "method": "tools/call",
        "params": {
            "name": "sendMessage",
            "arguments": {
                "content": [{"type": "text", "text": message}],
                "catalog": "AWS",
                **({"sessionId": session_id} if session_id else {}),
            }
        }
    })

    url = f"{MCP_ENDPOINT}/mcp"

    # Sign with SigV4
    request = AWSRequest(method="POST", url=url, data=body, headers={
        "Content-Type": "application/json",
        "Host": MCP_ENDPOINT.replace("https://", "").replace("http://", ""),
    })
    SigV4Auth(creds, "partnercentral-agents-mcp", "us-east-1").add_auth(request)

    async with httpx.AsyncClient() as client:
        response = await client.post(url, content=body, headers=dict(request.headers))

    if response.status_code != 200:
        return json.dumps({"error": f"MCP returned {response.status_code}: {response.text[:200]}"})

    result = response.json()
    if result.get("result", {}).get("content", [{}])[0].get("text"):
        try:
            inner = json.loads(result["result"]["content"][0]["text"])
            text_parts = []
            for block in inner.get("content", []):
                if block.get("type") == "ASSISTANT_RESPONSE" and block.get("content", {}).get("text"):
                    text_parts.append(block["content"]["text"])
            return json.dumps({"response": "\n\n".join(text_parts) or inner.get("content", [{}])[0].get("content", {}).get("text", "No response"), "sessionId": inner.get("sessionId", session_id)})
        except (json.JSONDecodeError, KeyError, IndexError):
            return json.dumps({"response": result["result"]["content"][0]["text"]})

    return json.dumps({"response": json.dumps(result)})


async def run_apn_agent(messages: list, session_id: str) -> AsyncGenerator[dict, None]:
    """Run the APN agent and yield SSE events."""
    model = BedrockModel(model_id=MODEL_ID)
    agent = Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[list_opportunities, get_opportunity, get_aws_opportunity_summary, list_funding_applications, get_funding_details, send_mcp_message],
    )

    last_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", [])
            if content and isinstance(content[0], dict) and "text" in content[0]:
                last_message = content[0]["text"]
            break

    result = agent(last_message)
    response_text = str(result)

    # Emit tool call events
    tool_names = ["list_opportunities", "get_opportunity", "get_aws_opportunity_summary", "list_funding_applications", "get_funding_details", "send_mcp_message"]
    for name in tool_names:
        if name in str(result.message.get("content", [])) if hasattr(result, "message") else False:
            yield {"type": "tool_call", "tool": name}

    yield {"type": "response", "text": response_text}
