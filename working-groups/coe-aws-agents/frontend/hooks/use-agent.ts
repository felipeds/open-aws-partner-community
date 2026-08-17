import { useState, useCallback, useRef } from "react"
import type { AgentState, EstimateResult, Message, PipelineStep } from "@/lib/types"

// Call the backend directly to bypass Amplify's 29s SSR proxy timeout.
// Falls back to the Next.js proxy route for local development.
const AGENT_ENDPOINT =
  process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/run`
    : "/api/agent/run"

export interface AgentRunRequest {
  services?: { type: string; config: Record<string, string | number | string[]> }[]
  region?: string
  prompt?: string
  files?: Array<{ name: string; type: string; content: string }>
}

interface AgentHookState {
  agentState: AgentState
  messages: Message[]
  pipelineSteps: PipelineStep[]
  currentStep: number
  currentAction?: string
  currentUrl?: string
  result: EstimateResult | null
  error: string | null
}

const INITIAL_STATE: AgentHookState = {
  agentState: "idle",
  messages: [],
  pipelineSteps: [],
  currentStep: -1,
  currentAction: undefined,
  currentUrl: undefined,
  result: null,
  error: null,
}

export function useAgent() {
  const [state, setState] = useState<AgentHookState>(INITIAL_STATE)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async (request: AgentRunRequest, userPromptText: string, image?: string, fileName?: string) => {
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    setState({
      ...INITIAL_STATE,
      agentState: "running",
      messages: [{ id: "u1", role: "user", content: userPromptText, timestamp: new Date(), image, fileName }],
    })

    try {
      const res = await fetch(AGENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Backend error: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parsed = consumeSseBuffer(buffer)
        buffer = parsed.remainder

        for (const event of parsed.events) {
          setState((prev) => applyEvent(prev, event))
        }
      }

      const parsed = consumeSseBuffer(`${buffer}\n\n`)
      for (const event of parsed.events) {
        setState((prev) => applyEvent(prev, event))
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return
      setState((prev) => ({
        ...prev,
        agentState: "error",
        error: (err as Error).message,
      }))
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState(INITIAL_STATE)
  }, [])

  return { ...state, run, reset }
}

interface ParsedSseEvent {
  type?: string
  [key: string]: unknown
}

function consumeSseBuffer(input: string): { events: ParsedSseEvent[]; remainder: string } {
  const normalized = input.replace(/\r\n/g, "\n")
  const blocks = normalized.split("\n\n")
  const remainder = blocks.pop() ?? ""
  const events = blocks
    .map(parseSseEventBlock)
    .filter((event): event is ParsedSseEvent => event !== null)

  return { events, remainder }
}

function parseSseEventBlock(block: string): ParsedSseEvent | null {
  let explicitEventType: string | undefined
  const dataLines: string[] = []

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trimEnd()
    if (!line || line.startsWith(":")) continue

    if (line.startsWith("event:")) {
      explicitEventType = line.slice(6).trim()
      continue
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) return null

  try {
    const parsed = JSON.parse(dataLines.join("\n")) as ParsedSseEvent
    if (!parsed.type && explicitEventType) {
      parsed.type = explicitEventType
    }
    return parsed
  } catch {
    return null
  }
}

function applyEvent(prev: AgentHookState, event: Record<string, unknown>): AgentHookState {
  switch (event.type) {
    case "architecture_analyzed": {
      const bullets = (event.services_summary as string[] | undefined) ?? []
      const bulletText = bullets.length > 0 ? `\n\nServices detected:\n${bullets.map((s) => `• ${s}`).join("\n")}` : ""
      const content = `I identified the following architecture from your diagram:\n\n${String(event.detail ?? "")}${bulletText}\n\nStarting estimate...`
      const msg = { id: `arch-${Date.now()}`, role: "agent" as const, content, timestamp: new Date() }
      return { ...prev, messages: [...prev.messages, msg] }
    }

    case "step_started": {
      const label = String(event.step_label ?? "")
      const idx = Number(event.step_index ?? prev.pipelineSteps.length)
      const steps = [...prev.pipelineSteps]
      if (!steps.find((s) => s.id === idx)) {
        steps.push({ id: idx, title: label, description: String(event.detail ?? ""), status: "active" })
      } else {
        steps[idx] = { ...steps[idx], status: "active" }
      }
      return { ...prev, pipelineSteps: steps, currentStep: idx, currentAction: label }
    }

    case "step_completed": {
      const idx = Number(event.step_index ?? -1)
      const steps = prev.pipelineSteps.map((s) =>
        s.id === idx ? { ...s, status: "complete" as const } : s
      )
      return { ...prev, pipelineSteps: steps }
    }

    case "browser_action":
      return {
        ...prev,
        currentAction: String(event.detail ?? event.browser_status ?? ""),
        currentUrl: event.browser_url ? String(event.browser_url) : prev.currentUrl,
      }

    case "estimate_ready": {
      const r = event.result as Record<string, unknown>
      const stats = r.agent_stats as Record<string, unknown>
      const breakdown = (r.breakdown as { service: string; label: string; cost: number }[]) ?? []
      const assumptions = (r.assumptions as { field: string; assumed_value: unknown; reason: string }[]) ?? []
      const warnings = (r.warnings as { code: string; message: string; service?: string | null }[]) ?? []
      const result: EstimateResult = {
        total: Number(r.total_monthly ?? 0),
        breakdown: breakdown.map((b) => ({ service: b.label || b.service, cost: b.cost })),
        link: String(r.share_url ?? ""),
        assumptions,
        warnings,
        stats: {
          browserSessions: Number(stats?.sessions ?? 1),
          actionsExecuted: Number(stats?.actions ?? 0),
          totalTime: `~${Math.round(Number(stats?.duration_seconds ?? 0))}s`,
          services: Number(stats?.services_configured ?? breakdown.length),
        },
      }
      const agentMsg = {
        id: "a1",
        role: "agent" as const,
        content: `Estimate complete! Total: $${result.total.toFixed(2)}/mo across ${result.breakdown.length} service(s).`,
        timestamp: new Date(),
      }
      const steps = prev.pipelineSteps.map((s) => ({ ...s, status: "complete" as const }))
      return { ...prev, agentState: "complete", result, pipelineSteps: steps, messages: [...prev.messages, agentMsg] }
    }

    case "error": {
      const errMsg = {
        id: `e${Date.now()}`,
        role: "agent" as const,
        content: `Error: ${String(event.detail ?? "Unknown error")}`,
        timestamp: new Date(),
      }
      return { ...prev, agentState: "error", error: String(event.detail ?? ""), messages: [...prev.messages, errMsg] }
    }

    default:
      return prev
  }
}
