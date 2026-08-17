"use client"

import { useState, useRef, useEffect } from "react"
import { Send, RotateCcw, Loader2, Calculator, Plus, Paperclip, X, FileText, Image, Copy, LogOut, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChat, type ChatMessage } from "@/hooks/use-chat"
import { signOut } from "next-auth/react"

function handleLogout() {
  // Clear cookies client-side as fallback, then redirect
  signOut({ callbackUrl: '/login' }).catch(() => {
    // If signOut API fails, force clear and redirect
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    window.location.href = '/login';
  });
}
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { CalculatorLinkCard } from "./calculator-link-card"
import { DownloadCard } from "./download-card"

function extractCalculatorUrl(text: string): string | null {
  const match = text.match(/https:\/\/calculator\.aws\/#\/estimate\?id=[a-f0-9]+/)
  return match ? match[0] : null
}

function stripCalculatorLinks(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\(https:\/\/calculator\.aws[^)]*\)/g, '$1')
    .replace(/https:\/\/calculator\.aws\/[^\s)"]*\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  const calculatorUrl = !isUser ? (message.calculatorUrl || extractCalculatorUrl(message.content)) : null
  const displayContent = !isUser && calculatorUrl ? stripCalculatorLinks(message.content) : message.content

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "rounded-2xl bg-primary text-primary-foreground px-4 py-3" : "space-y-3"}`}>
        {isUser ? (
          <div className="whitespace-pre-wrap text-sm">
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {message.attachments.map((a, i) => (
                  a.preview ? (
                    <img key={i} src={a.preview} alt={a.name} className="max-h-48 rounded-lg" />
                  ) : (
                    <span key={i} className="inline-flex items-center gap-1 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                      📄 {a.name}
                    </span>
                  )
                ))}
              </div>
            )}
            {message.content}
          </div>
        ) : (
          <>
            <div className="group relative rounded-2xl bg-muted px-5 py-4">
              <button
                onClick={() => { navigator.clipboard.writeText(message.content); }}
                className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100"
                title="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-headings:my-4 prose-headings:font-semibold prose-table:my-4 prose-hr:my-4 [&_a]:text-blue-600 [&_a]:underline [&_table]:text-xs [&_table]:w-full [&_th]:px-2 [&_td]:px-2 [&_th]:py-1.5 [&_td]:py-1.5 [&_th]:border [&_td]:border [&_th]:bg-muted-foreground/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
            </div>
            {calculatorUrl && <CalculatorLinkCard url={calculatorUrl} />}
            {message.downloadUrl && message.downloadFilename && <DownloadCard url={message.downloadUrl} filename={message.downloadFilename} />}
          </>
        )}
      </div>
    </div>
  )
}

const STEP_LABELS: Record<string, { icon: string; label: string }> = {
  delegate_calculator: { icon: "💰", label: "Creating cost estimate..." },
  delegate_project_plan: { icon: "📄", label: "Building project plan..." },
  delegate_apn: { icon: "🤝", label: "Querying Partner Central..." },
  list_opportunities: { icon: "📋", label: "Listing opportunities..." },
  get_opportunity: { icon: "🔍", label: "Getting opportunity details..." },
  get_aws_opportunity_summary: { icon: "☁️", label: "Getting AWS view..." },
  list_funding_applications: { icon: "💵", label: "Listing fundings..." },
  search_services: { icon: "🔍", label: "Searching services..." },
  get_service_fields: { icon: "⚙️", label: "Loading configuration..." },
  create_estimate: { icon: "📋", label: "Creating estimate..." },
  add_service: { icon: "📦", label: "Adding services..." },
  export_estimate: { icon: "📤", label: "Generating link..." },
  import_estimate: { icon: "📥", label: "Importing estimate..." },
  collect_info: { icon: "📝", label: "Saving information..." },
  generate_milestones: { icon: "📅", label: "Generating milestones..." },
  generate_cost_estimate: { icon: "💰", label: "Creating cost estimate..." },
  generate_document: { icon: "📄", label: "Generating document..." },
}

function ProgressIndicator({ currentStep, completedSteps }: { currentStep: string | null; completedSteps: string[] }) {
  const allSteps = [...completedSteps, ...(currentStep ? [currentStep] : [])]
  const uniqueSteps = [...new Set(allSteps)]

  return (
    <div className="flex justify-start">
      <div className="w-72 rounded-2xl bg-muted px-4 py-3 space-y-2">
        {uniqueSteps.map((step, i) => {
          const info = STEP_LABELS[step] || { icon: "⏳", label: step }
          const isCurrent = step === currentStep
          return (
            <div key={i} className={`flex items-center gap-2 text-sm transition-opacity ${isCurrent ? "opacity-100" : "opacity-50"}`}>
              <span className="text-base">{isCurrent ? info.icon : "✓"}</span>
              <span className={isCurrent ? "font-medium" : ""}>{info.label}</span>
              {isCurrent && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
            </div>
          )
        })}
        {uniqueSteps.length === 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Thinking...</span>
      </div>
    </div>
  )
}

const EXAMPLES = [
  "Create a cost estimate with Lambda, API Gateway, and DynamoDB in us-east-1",
  "Help me build a project plan for a serverless migration PoC",
  "List my opportunities in Partner Central",
  "Validate my project plan (attach .docx)",
]

const ACCEPTED_FILES = ".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.md,.doc,.docx,.csv"

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatInterface() {
  const { messages, isLoading, currentStep, completedSteps, error, sendMessage, reset } = useChat()
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<{ name: string; type: string; data: string }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isLoading])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return
    for (const file of Array.from(selected)) {
      if (file.size > 5 * 1024 * 1024) continue // 5MB max
      const data = await toBase64(file)
      setFiles(prev => [...prev, { name: file.name, type: file.type, data }])
    }
    e.target.value = ""
  }

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if ((!input.trim() && files.length === 0) || isLoading) return
    sendMessage(input.trim() || "Analyze the attached file(s) and create an estimate.", files.length > 0 ? files : undefined)
    setInput("")
    setFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed top-0 z-10 flex w-full items-center justify-between border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">CoE AWS Agents</h1>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <Plus className="mr-1 h-4 w-4" /> New conversation
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 pb-32">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div className="flex justify-start">
                <div className="max-w-[85%] space-y-3">
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2">
                      <p>Hi! 👋 I'm your <strong>AWS Agents</strong> assistant. I can help you with:</p>
                      <ul className="my-2 space-y-1">
                        <li>💰 <strong>Cost Estimates</strong> — Generate shareable AWS Pricing Calculator links</li>
                        <li>📄 <strong>Project Plans</strong> — Build AWS PoC Project Plan documents (.docx)</li>
                        <li>✅ <strong>Validate Plans</strong> — Upload a project plan to check completeness and compliance</li>
                        <li>🤝 <strong>Partner Central</strong> — Query opportunities, fundings, and pipeline data</li>
                      </ul>
                      <p>What would you like to work on? 🚀</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(ex); }}
                    className="rounded-lg border p-3 text-left text-sm text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} />}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 w-full border-t bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
                  {file.type.startsWith("image/") ? <Image className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILES}
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the AWS services to estimate, or attach a file..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button type="submit" size="icon" className="h-10 w-10" disabled={(!input.trim() && files.length === 0) || isLoading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
