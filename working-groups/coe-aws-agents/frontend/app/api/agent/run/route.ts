/**
 * Next.js API route that proxies SSE from the Python FastAPI backend.
 * POST /api/agent/run → forwards to http://localhost:8000/run
 */
export const maxDuration = 900 // 15 minutes — Amplify Lambda max
export const dynamic = "force-dynamic"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(req: Request) {
  const body = await req.json()

  let backendResponse: Response
  try {
    backendResponse = await fetch(`${BACKEND_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: `Cannot reach backend: ${err}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!backendResponse.ok || !backendResponse.body) {
    return new Response(JSON.stringify({ error: "Backend unavailable" }), {
      status: backendResponse.status || 502,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(backendResponse.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
