"""CoE AWS Agents — Python Backend (FastAPI + Strands)"""
import os
import json
import time
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse

from middleware.auth import verify_token, AuthUser
from agents.orchestrator import run_orchestrator

# ---------------------------------------------------------------------------
# Session store (in-memory)
# ---------------------------------------------------------------------------
sessions: dict = {}


def get_or_create_session(session_id: str | None) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())
    if session_id not in sessions:
        sessions[session_id] = {"id": session_id, "messages": []}
    return sessions[session_id]


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Agent server running on http://0.0.0.0:{os.getenv('PORT', '3001')}")
    yield

app = FastAPI(title="CoE AWS Agents", lifespan=lifespan)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# SSE Chat Endpoint (compatible with frontend)
# ---------------------------------------------------------------------------
@app.post("/api/chat")
async def chat(request: Request, user: AuthUser = Depends(verify_token)):
    body = await request.json()
    message = body.get("message")
    session_id = body.get("sessionId")
    files = body.get("files")

    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    session = get_or_create_session(session_id)

    async def event_stream():
        start_time = time.time()
        tools_called = []

        # Build user message content
        content = [{"text": message}]
        # TODO: handle file attachments (docx, images, etc.)

        session["messages"].append({"role": "user", "content": content})

        try:
            user_perms = {"email": user.email, "can_access_apn": user.can_access_apn}

            async for event in run_orchestrator(session["messages"], session["id"], user_perms):
                if event.get("type") == "tool_call":
                    tools_called.append(event.get("tool"))
                yield {"data": json.dumps(event)}

            yield {"data": json.dumps({"type": "done", "sessionId": session["id"]})}

            # Structured log
            duration_ms = int((time.time() - start_time) * 1000)
            print(json.dumps({
                "event": "invocation_complete",
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "userEmail": user.email,
                "sessionId": session["id"],
                "durationMs": duration_ms,
                "toolsCalled": tools_called,
            }))

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            print(json.dumps({
                "event": "invocation_error",
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "userEmail": user.email,
                "sessionId": session["id"],
                "error": str(e),
                "durationMs": duration_ms,
                "toolsCalled": tools_called,
            }))
            yield {"data": json.dumps({"type": "error", "error": str(e)})}

    return EventSourceResponse(event_stream())


# ---------------------------------------------------------------------------
# AgentCore Runtime Endpoints
# ---------------------------------------------------------------------------
@app.get("/ping")
async def ping():
    return {"status": "Healthy"}


@app.post("/invocations")
async def invocations(request: Request):
    """AgentCore Runtime invocation endpoint."""
    body = await request.json()
    message = body.get("prompt") or body.get("message")
    session_id = body.get("sessionId")
    user_email = body.get("userEmail", "unknown")
    can_access_apn = body.get("canAccessApn", False)

    if not message:
        raise HTTPException(status_code=400, detail="prompt is required")

    session = get_or_create_session(session_id)

    # Structured log - start
    print(json.dumps({
        "event": "invocation_start",
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "userEmail": user_email,
        "sessionId": session["id"],
        "promptLength": len(message),
        "hasFiles": bool(body.get("files")),
    }))

    session["messages"].append({"role": "user", "content": [{"text": message}]})

    async def event_stream():
        start_time = time.time()
        tools_called = []

        try:
            user_perms = {"email": user_email, "can_access_apn": can_access_apn}

            async for event in run_orchestrator(session["messages"], session["id"], user_perms):
                if event.get("type") == "tool_call":
                    tools_called.append(event.get("tool"))
                yield {"data": json.dumps(event)}

            yield {"data": json.dumps({"type": "done", "sessionId": session["id"]})}

            duration_ms = int((time.time() - start_time) * 1000)
            print(json.dumps({
                "event": "invocation_complete",
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "userEmail": user_email,
                "sessionId": session["id"],
                "durationMs": duration_ms,
                "toolsCalled": tools_called,
            }))

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            print(json.dumps({
                "event": "invocation_error",
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "userEmail": user_email,
                "sessionId": session["id"],
                "error": str(e),
                "durationMs": duration_ms,
                "toolsCalled": tools_called,
            }))
            yield {"data": json.dumps({"type": "error", "error": str(e)})}

    return EventSourceResponse(event_stream())


# ---------------------------------------------------------------------------
# File Download
# ---------------------------------------------------------------------------
from fastapi.responses import FileResponse
from pathlib import Path

GENERATED_DIR = Path(__file__).parent / "generated"
GENERATED_DIR.mkdir(exist_ok=True)


@app.get("/api/download/{filename}")
async def download_file(filename: str, user: AuthUser = Depends(verify_token)):
    filepath = (GENERATED_DIR / filename).resolve()
    if not filepath.is_relative_to(GENERATED_DIR.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(str(filepath), filename=filename)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "3001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
