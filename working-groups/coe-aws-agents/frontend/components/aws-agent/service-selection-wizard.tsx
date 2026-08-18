"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ServiceCard } from "./service-card"
import { ServiceConfigForm } from "./service-config-form"
import { AWS_SERVICES, AWS_REGIONS } from "@/lib/types"
import type { ServiceType, ServiceConfig } from "@/lib/types"

interface ServiceSelectionWizardProps {
  onSubmit: (configs: ServiceConfig[], region: string) => void
}

export function ServiceSelectionWizard({ onSubmit }: ServiceSelectionWizardProps) {
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([])
  const [configs, setConfigs] = useState<Record<string, ServiceConfig>>({})
  const [region, setRegion] = useState("us-east-1")

  const toggleService = (type: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(type) ? prev.filter((s) => s !== type) : [...prev, type]
    )
  }

  const handleConfigChange = (
    serviceType: ServiceType,
    config: Record<string, string | number | string[]>
  ) => {
    setConfigs((prev) => ({
      ...prev,
      [serviceType]: { type: serviceType, config },
    }))
  }

  const handleSubmit = () => {
    const serviceConfigs = selectedServices.map(
      (type) => configs[type] || { type, config: {} }
    )
    onSubmit(serviceConfigs, region)
  }

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0
    if (step === 2) return true
    if (step === 3) return !!region
    return false
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 transition-colors ${
                  s < step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-medium">Select services</h3>
              <p className="text-sm text-muted-foreground">
                Choose the AWS services your architecture uses
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AWS_SERVICES.map((service) => (
                <ServiceCard
                  key={service.type}
                  type={service.type}
                  name={service.name}
                  description={service.description}
                  selected={selectedServices.includes(service.type)}
                  onClick={() => toggleService(service.type)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-medium">Configure services</h3>
              <p className="text-sm text-muted-foreground">
                Define the usage profile for each service
              </p>
            </div>
            <ServiceConfigForm
              services={selectedServices}
              configs={configs}
              onConfigChange={handleConfigChange}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-medium">Select region</h3>
              <p className="text-sm text-muted-foreground">
                Choose the AWS region for the estimate
              </p>
            </div>
            <div className="mx-auto max-w-sm space-y-2">
              <Label>AWS Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AWS_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed()} className="gap-2">
            <Rocket className="h-4 w-4" />
            Generate estimate
          </Button>
        )}
      </div>
    </div>
  )
}
