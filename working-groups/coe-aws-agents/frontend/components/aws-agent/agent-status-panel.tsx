"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle } from "lucide-react"
import { PipelineTracker } from "./pipeline-tracker"
import type { AgentState, PipelineStep, EstimateResult } from "@/lib/types"

interface AgentStatusPanelProps {
  agentState: AgentState
  steps: PipelineStep[]
  currentStep: number
  currentAction?: string
  currentUrl?: string
  result?: EstimateResult | null
}

interface AgentStatusPanelWrapperProps extends AgentStatusPanelProps {
  isMobile?: boolean
}

export function AgentStatusPanelWrapper({
  isMobile = false,
  ...props
}: AgentStatusPanelWrapperProps) {
  if (isMobile) {
    return (
      <div className="flex h-full w-full flex-col gap-4 bg-background p-4">
        <AgentStatusPanelContent {...props} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="flex h-full w-[340px] shrink-0 flex-col gap-4 border-l border-border bg-background p-4"
    >
      <AgentStatusPanelContent {...props} />
    </motion.div>
  )
}

export function AgentStatusPanel(props: AgentStatusPanelProps) {
  return <AgentStatusPanelWrapper {...props} />
}

function AgentStatusPanelContent({
  agentState,
  steps,
  currentStep,
  currentAction,
  currentUrl,
  result,
}: AgentStatusPanelProps) {
  const isActive = agentState === "running"
  const isComplete = agentState === "complete"

  return (
    <>
      {/* Pipeline Tracker */}
      <PipelineTracker steps={steps} currentStep={currentStep} />

      {/* Stats Card (only when complete) */}
      {isComplete && result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Statistics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Browser sessions</span>
              <span className="font-mono">{result.stats.browserSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Actions executed</span>
              <span className="font-mono">{result.stats.actionsExecuted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total time</span>
              <span className="font-mono">{result.stats.totalTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Services</span>
              <span className="font-mono">{result.stats.services}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5 font-mono text-green-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Success
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {agentState === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/50 bg-destructive/10 p-4"
        >
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Execution error</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            The agent encountered an error while processing your request. Please
            try again.
          </p>
        </motion.div>
      )}
    </>
  )
}
