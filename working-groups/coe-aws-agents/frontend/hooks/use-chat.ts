import { useState, useCallback, useRef } from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  calculatorUrl?: string
  downloadUrl?: string
  downloadFilename?: string
  attachments?: { name: string; type: string; preview?: string }[]
  timestamp: Date
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  currentStep: string | null
  completedSteps: string[]
  sessionId: string | null
  error: string | null
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentStep: null,
    completedSteps: [],
    sessionId: null,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, files?: { name: string; type: string; data: string }[]) => {
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      attachments: files?.map(f => ({ name: f.name, type: f.type, preview: f.type.startsWith("image/") ? `data:${f.type};base64,${f.data}` : undefined })),
      timestamp: new Date(),
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true,
      currentStep: null,
      completedSteps: [],
      error: null,
    }))

    try {
      // Get fresh auth token from Next.js server
      const tokenRes = await fetch('/api/token')
      if (tokenRes.status === 401) {
        window.location.href = '/login'
        return
      }
      const tokenData = tokenRes.ok ? await tokenRes.json() : {}
      const accessToken = tokenData.token || ''

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ message: content, sessionId: state.sessionId, files }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let responseText = ""
      let calculatorUrl: string | undefined
      let downloadUrl: string | undefined
      let downloadFilename: string | undefined
      let newSessionId: string | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const block of lines) {
          const dataLine = block.split("\n").find((l) => l.startsWith("data:"))
          if (!dataLine) continue
          try {
            const event = JSON.parse(dataLine.slice(5).trim())
            if (event.type === "response") {
              responseText = event.text
            } else if (event.type === "tool_call") {
              setState((prev) => ({
                ...prev,
                completedSteps: prev.currentStep ? [...prev.completedSteps, prev.currentStep] : prev.completedSteps,
                currentStep: event.tool,
              }))
            } else if (event.type === "export_url") {
              calculatorUrl = event.url
            } else if (event.type === "download_ready") {
              downloadUrl = event.url
              downloadFilename = event.filename
            } else if (event.type === "done") {
              newSessionId = event.sessionId
            } else if (event.type === "error") {
              throw new Error(event.error)
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: responseText,
        calculatorUrl,
        downloadUrl: downloadUrl ? `${BACKEND_URL}${downloadUrl}` : undefined,
        downloadFilename,
        timestamp: new Date(),
      }

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
        isLoading: false,
        currentStep: null,
        completedSteps: [],
        sessionId: newSessionId || prev.sessionId,
      }))
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return
      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentStep: null,
        completedSteps: [],
        error: (err as Error).message,
      }))
    }
  }, [state.sessionId])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ messages: [], isLoading: false, currentStep: null, completedSteps: [], sessionId: null, error: null })
  }, [])

  return { ...state, sendMessage, reset }
}
