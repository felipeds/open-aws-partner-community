"use client"

import { motion } from "framer-motion"
import { DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
          <DollarSign className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        )}
      >
        {!isUser && (
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Agent
          </span>
        )}

        {/* Image attachment */}
        {isUser && message.image && (
          <img
            src={message.image}
            alt="attachment"
            className="mb-2 max-h-[200px] w-full rounded-lg object-contain"
          />
        )}

        {/* Non-image file pill */}
        {isUser && !message.image && message.fileName && (
          <div className="mb-2 flex items-center gap-1.5 text-sm opacity-80">
            <span>📄</span>
            <span className="truncate">{message.fileName}</span>
          </div>
        )}

        {message.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content.split("\n").map((line, i) => {
              if (line.startsWith("› ")) {
                return (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary">›</span>
                    <span>{line.slice(2)}</span>
                  </div>
                )
              }
              return <p key={i}>{line}</p>
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
        <DollarSign className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-card border border-border px-4 py-3">
        <motion.span
          className="h-2 w-2 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </motion.div>
  )
}
