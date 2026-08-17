"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, FileText, Paperclip, Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AgentRunRequest } from "@/hooks/use-agent"

const AWS_REGIONS = [
  { value: "us-east-1", label: "N. Virginia - us-east-1" },
  { value: "us-east-2", label: "Ohio - us-east-2" },
  { value: "us-west-1", label: "N. California - us-west-1" },
  { value: "us-west-2", label: "Oregon - us-west-2" },
  { value: "sa-east-1", label: "São Paulo - sa-east-1" },
]

interface AttachedFile {
  name: string
  type: string
  content: string // base64
  previewUrl?: string // object URL for images
}

interface InitialStateProps {
  onSubmit: (request: AgentRunRequest, displayText: string, image?: string, fileName?: string) => void
}

const ACCEPTED = ".pdf,.md,.txt,.png,.jpg,.jpeg"
const MAX_FILES = 3
const MAX_BYTES = 10 * 1024 * 1024

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(",")[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function isImage(type: string) {
  return type.startsWith("image/")
}

export function InitialState({ onSubmit }: InitialStateProps) {
  const [prompt, setPrompt] = useState("")
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [region, setRegion] = useState("us-east-1")
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = async (raw: FileList | null) => {
    if (!raw) return
    const toAdd = Array.from(raw).slice(0, MAX_FILES - files.length)
    const encoded = await Promise.all(
      toAdd
        .filter((f) => f.size <= MAX_BYTES)
        .map(async (f) => ({
          name: f.name,
          type: f.type,
          content: await toBase64(f),
          previewUrl: isImage(f.type) ? URL.createObjectURL(f) : undefined,
        }))
    )
    setFiles((prev) => [...prev, ...encoded].slice(0, MAX_FILES))
  }

  const removeFile = (name: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.name === name)
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((f) => f.name !== name)
    })
  }

  const handleSubmit = async () => {
    if (!prompt.trim() && files.length === 0) return

    // Find first image file for the chat bubble
    const imageFile = files.find((f) => isImage(f.type))
    const nonImageFile = !imageFile ? files[0] : undefined

    // Build data URL for the image (needs full data URL, not just base64)
    let imageDataUrl: string | undefined
    if (imageFile) {
      // Re-derive from base64 content we already have
      imageDataUrl = `data:${imageFile.type};base64,${imageFile.content}`
    }

    const request: AgentRunRequest = {
      prompt: prompt.trim() || undefined,
      region,
      files: files.length > 0 ? files.map(({ name, type, content }) => ({ name, type, content })) : undefined,
    }
    onSubmit(
      request,
      prompt.trim() || `[${files.map((f) => f.name).join(", ")}]`,
      imageDataUrl,
      nonImageFile?.name,
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-full flex-col items-center px-4 py-8"
    >
      {/* Icon */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <DollarSign className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="absolute -inset-2 -z-10 rounded-3xl bg-primary/10 blur-xl" />
      </motion.div>

      {/* Title */}
      <h1 className="mb-2 text-center text-xl font-semibold md:text-2xl">
        Agent Calculator
      </h1>
      <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
        The agent navigates the AWS Pricing Calculator and builds a cost estimate automatically.
      </p>

      <div className="w-full max-w-md space-y-3">
        {/* Region selector */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Select the region for your cost estimate. Pricing varies by region.</p>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AWS_REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Textarea */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Describe your architecture in natural language, or attach a diagram below and leave this empty.</p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g.: 2 Lambda 512MB, 1M invocations/mo, 200ms. S3 Standard 100GB, 50k PUTs..."
            className="min-h-[120px] resize-none border-primary/40"
          />
        </div>

        {/* File upload zone */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Supported: architecture diagrams (PNG, JPG), documents (PDF, MD, TXT). The agent uses Claude vision to analyze images.</p>
          <div
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-sm text-muted-foreground transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-primary/40 hover:bg-muted/30"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
          >
            <Paperclip className="h-4 w-4" />
            <span>Attach files — PDF, MD, TXT, PNG, JPG (max 10 MB each, up to 3)</span>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Attached file pills with thumbnails */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                {f.previewUrl ? (
                  <img
                    src={f.previewUrl}
                    alt={f.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted-foreground/10">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="min-w-0 flex-1 truncate text-xs">{f.name}</span>
                <button
                  onClick={() => removeFile(f.name)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() && files.length === 0}
          className="w-full gap-2"
        >
          <Rocket className="h-4 w-4" />
          Generate AWS Calculator
        </Button>
      </div>
    </motion.div>
  )
}
