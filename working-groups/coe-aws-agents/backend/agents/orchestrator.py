"""Orchestrator Agent — routes user requests to appropriate sub-agents."""
import os
from typing import AsyncGenerator

from strands import Agent, tool
from strands.models import BedrockModel

from agents.calculator import run_calculator_agent
from agents.project_plan import run_project_plan_agent
from agents.apn import run_apn_agent


MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-6")

SYSTEM_PROMPT = """You are an orchestrator agent that routes user requests to specialized sub-agents.

You have three sub-agents available:
1. **Calculator Agent** — Creates AWS cost estimates and generates shareable calculator.aws links
2. **Project Plan Agent** — Creates or validates AWS PoC Project Plan documents (.docx)
3. **APN Agent** — Queries AWS Partner Central for opportunities, fundings, and pipeline data

ROUTING RULES:
- If the user asks about cost estimates, pricing, AWS services pricing → delegate to Calculator Agent
- If the user asks about project plans, PoC documents, milestones, funding docs → delegate to Project Plan Agent
- If the user asks about Partner Central, opportunities, fundings, APN → delegate to APN Agent
- If the user's intent is unclear, ASK which agent they want to use
- REFUSE any request that is not related to AWS (cost estimates, project plans, or partner central)

LANGUAGE: Always respond in the same language the user uses.
"""


@tool
def delegate_calculator(message: str) -> str:
    """Delegate a request to the Calculator Agent for AWS cost estimation.

    Args:
        message: The user's message about cost estimation
    """
    # This is a placeholder — actual execution happens in run_orchestrator
    return f"[DELEGATE:calculator] {message}"


@tool
def delegate_project_plan(message: str) -> str:
    """Delegate a request to the Project Plan Agent for document creation/validation.

    Args:
        message: The user's message about project plans
    """
    return f"[DELEGATE:project_plan] {message}"


@tool
def delegate_apn(message: str) -> str:
    """Delegate a request to the APN Agent for Partner Central queries.

    Args:
        message: The user's message about Partner Central
    """
    return f"[DELEGATE:apn] {message}"


async def run_orchestrator(
    messages: list,
    session_id: str,
    user_perms: dict,
) -> AsyncGenerator[dict, None]:
    """Run the orchestrator agent and yield SSE events."""

    model = BedrockModel(model_id=MODEL_ID)

    # Build the orchestrator — it decides which sub-agent to use
    orchestrator = Agent(
        model=model,
        system_prompt=SYSTEM_PROMPT,
        tools=[delegate_calculator, delegate_project_plan, delegate_apn],
    )

    # Get the last user message
    last_message = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", [])
            if content and isinstance(content[0], dict) and "text" in content[0]:
                last_message = content[0]["text"]
            break

    # Run orchestrator to determine routing
    result = orchestrator(last_message)
    response_text = str(result)

    # Check if a delegation happened
    if "[DELEGATE:calculator]" in response_text:
        yield {"type": "tool_call", "tool": "delegate_calculator"}
        async for event in run_calculator_agent(messages, session_id):
            yield event
    elif "[DELEGATE:project_plan]" in response_text:
        yield {"type": "tool_call", "tool": "delegate_project_plan"}
        async for event in run_project_plan_agent(messages, session_id):
            yield event
    elif "[DELEGATE:apn]" in response_text:
        if not user_perms.get("can_access_apn"):
            yield {"type": "response", "text": "❌ **Access denied to Partner Central.**\n\nYou don't have permission to access AWS Partner Central data. Contact your administrator to request access."}
            return
        yield {"type": "tool_call", "tool": "delegate_apn"}
        async for event in run_apn_agent(messages, session_id):
            yield event
    else:
        # Direct response from orchestrator (no delegation)
        yield {"type": "response", "text": response_text}
