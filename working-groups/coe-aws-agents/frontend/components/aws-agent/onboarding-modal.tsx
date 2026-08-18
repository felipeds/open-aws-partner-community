"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, MessageSquare, Paperclip, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative mx-4 w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
          >
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center">
          <Calculator className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h2 className="text-lg font-semibold">Welcome to AWS Cost Calculator Agent</h2>
          <p className="mt-1 text-sm text-foreground/75">Generate AWS pricing estimates through conversation.</p>
        </div>

        <div className="space-y-4">
          <Step icon={<MessageSquare className="h-4 w-4" />} title="Describe your architecture" description="Tell the agent what AWS services you need, with quantities and region." />
          <Step icon={<Paperclip className="h-4 w-4" />} title="Attach files" description="Upload architecture diagrams, spreadsheets, or docs — the agent will interpret them." />
          <Step icon={<Calculator className="h-4 w-4" />} title="Get your estimate" description="The agent configures everything and returns a shareable calculator.aws link." />
          <Step icon={<RefreshCw className="h-4 w-4" />} title="Iterate" description="Add or modify services in the same conversation — each update generates a new link." />
        </div>

        <Button className="mt-6 w-full" onClick={onClose}>Get started</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Step({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-foreground/60">{description}</p>
      </div>
    </div>
  )
}
