"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Monitor } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface BrowserPreviewProps {
  isActive: boolean
  currentAction?: string
  currentUrl?: string
}

export function BrowserPreview({ isActive, currentAction, currentUrl }: BrowserPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 rounded bg-background px-3 py-1">
          <span className="font-mono text-[10px] text-muted-foreground">
            {currentUrl || "calculator.aws/estimate/..."}
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-2 w-2 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] text-green-500">LIVE</span>
          </div>
        )}
      </div>

      {/* Browser Content */}
      <div className="relative h-48 bg-background">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {/* Simulated Calculator UI */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-6" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>

              {/* Active indicator overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.05, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: "linear-gradient(45deg, transparent, var(--primary), transparent)" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground"
            >
              <Monitor className="h-8 w-8" />
              <span className="text-xs">Browser session inactive</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      {isActive && currentAction && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentAction}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="font-mono text-[10px] text-muted-foreground truncate"
            >
              {currentAction}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
