"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, ExternalLink, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { EstimateResult } from "@/lib/types"

interface ResultCardProps {
  result: EstimateResult
}

export function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="flex gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
        <DollarSign className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 rounded-xl bg-card border border-border p-4">
        <span className="mb-3 block font-mono text-[10px] uppercase tracking-wider text-primary">
          Estimate ready
        </span>

        {/* Total */}
        <div className="mb-4">
          <div>
            <span className="text-2xl font-bold">
              ${(result.total * 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/yearly</span>
          </div>
          <div>
            <span className="text-lg text-muted-foreground">
              ${result.total.toFixed(2)}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/monthly</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="mb-4 space-y-2">
          {result.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.service}
                {item.quantity && item.quantity > 1 && (
                  <span className="ml-1 text-xs">(x{item.quantity})</span>
                )}
              </span>
              <span className="font-mono">${item.cost.toFixed(2)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <div className="text-right">
              <span className="font-mono">${result.total.toFixed(2)} /monthly</span>
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                ${(result.total * 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} /yearly
              </span>
            </div>
          </div>
        </div>

        {/* Link */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">
            Shareable link
          </label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={result.link}
              className="font-mono text-xs"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Open in browser */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => window.open(result.link, "_blank")}
        >
          <ExternalLink className="h-3 w-3" />
          Open in browser
        </Button>

        {result.assumptions.length > 0 && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Assumptions
            </label>
            <div className="space-y-2 rounded-lg border border-border bg-background/50 p-3">
              {result.assumptions.map((assumption, index) => (
                <div key={`${assumption.field}-${index}`} className="text-xs">
                  <span className="font-medium text-foreground">{assumption.field}</span>
                  <span className="text-muted-foreground"> = {String(assumption.assumed_value)}.</span>
                  <span className="ml-1 text-muted-foreground">{assumption.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </motion.div>
  )
}
