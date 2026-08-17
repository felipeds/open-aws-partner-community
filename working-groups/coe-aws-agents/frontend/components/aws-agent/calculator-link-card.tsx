"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Check, ExternalLink, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CalculatorLinkCardProps {
  url: string
}

export function CalculatorLinkCard({ url }: CalculatorLinkCardProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const audio = new Audio("/link-generated-sound.wav")
    audio.volume = 0.5
    audio.play().catch(() => {})
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Calculator className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">AWS Pricing Calculator</p>
          <p className="text-xs text-muted-foreground">Estimate generated successfully</p>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button variant="secondary" size="sm" onClick={handleCopy} className="shrink-0 gap-1.5">
          {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => window.open(url, "_blank")}
      >
        <ExternalLink className="h-3 w-3" />
        Open in browser
      </Button>
    </motion.div>
  )
}
