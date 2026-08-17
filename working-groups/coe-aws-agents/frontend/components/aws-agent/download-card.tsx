"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DownloadCardProps {
  url: string
  filename: string
}

export function DownloadCard({ url, filename }: DownloadCardProps) {
  useEffect(() => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">Project Plan</p>
          <p className="text-xs text-muted-foreground">Document generated successfully</p>
        </div>
      </div>

      <p className="mb-3 truncate text-xs text-foreground/60 font-mono">{filename}</p>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => window.open(url, "_blank")}
      >
        <Download className="h-3 w-3" />
        Download
      </Button>
    </motion.div>
  )
}
