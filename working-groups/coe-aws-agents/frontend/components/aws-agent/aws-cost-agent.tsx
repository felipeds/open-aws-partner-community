"use client"

import { useCallback, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAgent } from "@/hooks/use-agent"
import { Header } from "./header"
import { InitialState } from "./initial-state"
import { ChatMessage, TypingIndicator } from "./chat-message"
import { ResultCard } from "./result-card"
import { AgentStatusPanel, AgentStatusPanelWrapper } from "./agent-status-panel"
import type { AgentRunRequest } from "@/hooks/use-agent"

const DEMO_REQUEST: AgentRunRequest = {
  prompt: "2 Lambda 512MB, 1M req/mo, 300ms. S3 Standard 100GB.",
  region: "us-east-1",
}

export function AWSCostAgent() {
  const isMobile = useIsMobile()
  const { agentState, messages, pipelineSteps, currentStep, currentAction, currentUrl, result, run, reset } = useAgent()

  const handleSubmit = useCallback((request: AgentRunRequest, displayText: string, image?: string, fileName?: string) => {
    run(request, displayText, image, fileName)
  }, [run])

  const hasMessages = messages.length > 0
  const showPanel = agentState !== "idle"

  const agentPanel = (
    <AgentStatusPanel
      agentState={agentState}
      steps={pipelineSteps}
      currentStep={currentStep}
      currentAction={currentAction}
      currentUrl={currentUrl}
      result={result}
    />
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex min-h-0 flex-1 pt-16">
        {/* Chat Panel */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-6">
            {!hasMessages ? (
              <InitialState onSubmit={handleSubmit} />
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {agentState === "running" && <TypingIndicator />}
                {result && (() => {
                  const serviceFailedWarnings = result.warnings.filter(w => w.code === "SERVICE_FAILED")
                  return (
                    <>
                      {serviceFailedWarnings.length > 0 && (
                        <div className="space-y-2">
                          {serviceFailedWarnings.map((warning, i) => (
                            <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400">⚠️</span>
                                <div>
                                  <p className="font-medium text-amber-800 dark:text-amber-200">
                                    {warning.service ? `${warning.service} was not added to the estimate` : warning.message}
                                  </p>
                                  <p className="mt-1 text-amber-700 dark:text-amber-300">{warning.message}</p>
                                  {result.link && (
                                    <p className="mt-2 text-amber-600 dark:text-amber-400">
                                      You can add it manually by clicking{" "}
                                      <a href={result.link} target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-amber-800">
                                        "Update Estimate"
                                      </a>{" "}
                                      on the calculator page.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <ResultCard result={result} />
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Agent Status Panel - Desktop */}
        {!isMobile && (
          <AnimatePresence>
            {showPanel && agentPanel}
          </AnimatePresence>
        )}

        {/* Agent Status Panel - Mobile Sheet */}
        {isMobile && (
          <Sheet open={showPanel} onOpenChange={(open) => { if (!open) reset() }}>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <div className="h-full overflow-auto pt-8">
                <AgentStatusPanelWrapper
                  isMobile
                  agentState={agentState}
                  steps={pipelineSteps}
                  currentStep={currentStep}
                  currentAction={currentAction}
                  currentUrl={currentUrl}
                  result={result}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
