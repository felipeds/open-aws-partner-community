"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, FileText, CheckCircle, Handshake, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  { icon: <Calculator className="h-6 w-6" />, title: "Cost Calculator", description: "Generate AWS estimates in seconds" },
  { icon: <FileText className="h-6 w-6" />, title: "Project Plan", description: "Build PoC documents from conversation" },
  { icon: <CheckCircle className="h-6 w-6" />, title: "Plan Validation", description: "Check compliance with AWS funding rules" },
  { icon: <Handshake className="h-6 w-6" />, title: "Partner Central", description: "Query opportunities, fundings, and pipeline" },
]

export default function LoginPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden" style={{ background: '#f8f8fa' }}>
      {/* Animated mesh gradient background */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <motion.div
            className="absolute h-96 w-96 rounded-full"
            style={{ background: '#3b82f6', opacity: 0.25, filter: 'blur(80px)', top: '-5%', left: '-5%' }}
            animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute h-80 w-80 rounded-full"
            style={{ background: '#0f172a', opacity: 0.2, filter: 'blur(80px)', bottom: '-5%', right: '-5%' }}
            animate={{ x: [0, -60, 40, 0], y: [0, 80, -40, 0], scale: [1, 0.9, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute h-72 w-72 rounded-full"
            style={{ background: '#8b5cf6', opacity: 0.2, filter: 'blur(80px)', top: '25%', right: '10%' }}
            animate={{ x: [0, -50, 60, 0], y: [0, 50, -30, 0], scale: [1, 1.15, 0.85, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute h-64 w-64 rounded-full"
            style={{ background: '#06b6d4', opacity: 0.25, filter: 'blur(80px)', bottom: '20%', left: '10%' }}
            animate={{ x: [0, 60, -30, 0], y: [0, -40, 60, 0], scale: [1, 0.9, 1.15, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}
      <div className="relative z-10 mx-4 w-full max-w-sm text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-2xl font-semibold">CoE AWS Agents</h1>
        <p className="mt-2 text-sm text-foreground/60">Sign in to continue</p>

        {/* Feature carousel */}
        <div className="mt-8 rounded-xl border bg-muted/30 p-5 h-28 flex flex-col justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-3 text-primary">
                {FEATURES[activeFeature].icon}
                <span className="text-sm font-semibold">{FEATURES[activeFeature].title}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/70">{FEATURES[activeFeature].description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 flex justify-center gap-1.5">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeFeature ? "w-5 bg-primary" : "w-1.5 bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>

        <Button
          className="mt-8 w-full gap-2 cursor-pointer h-12 text-base"
          style={{ cursor: 'pointer' }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Access restricted to authorized accounts
        </p>
      </div>
    </div>
  )
}
