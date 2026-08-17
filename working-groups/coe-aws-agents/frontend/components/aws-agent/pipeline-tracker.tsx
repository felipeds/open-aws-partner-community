"use client"

import { motion } from "framer-motion"
import { Check, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineStep } from "@/lib/types"

interface PipelineTrackerProps {
  steps: PipelineStep[]
  currentStep: number
}

export function PipelineTracker({ steps, currentStep }: PipelineTrackerProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Agent pipeline
      </h3>
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isComplete = step.status === "complete"
          const isActive = step.status === "active"
          const isPending = step.status === "pending"

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 h-[calc(100%-8px)] w-0.5",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              <div className="flex items-start gap-3 py-2">
                {/* Status icon */}
                <div className="relative shrink-0">
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </motion.div>
                  )}
                  {isActive && (
                    <div className="relative flex h-6 w-6 items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  {isPending && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted">
                      <Circle className="h-2 w-2 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-xs",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.id}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium truncate",
                        isComplete && "text-foreground",
                        isActive && "text-primary",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
