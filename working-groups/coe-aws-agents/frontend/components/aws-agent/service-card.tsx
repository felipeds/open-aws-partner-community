"use client"

import { motion } from "framer-motion"
import { Check, Zap, Database, Brain, Globe, Box, Bell, Cloud, BarChart2, Shield, MessageSquare, Smartphone, Bot, Compass, Network, Clock, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServiceType } from "@/lib/types"

interface ServiceCardProps {
  type: ServiceType
  name: string
  description: string
  selected: boolean
  onClick: () => void
}

const iconMap: Record<ServiceType, React.ElementType> = {
  lambda: Zap,
  s3: Box,
  bedrock: Brain,
  apigateway: Globe,
  dynamodb: Database,
  sns_sqs: Bell,
  cloudfront: Cloud,
  cloudwatch: BarChart2,
  cognito: Shield,
  sqs: MessageSquare,
  amplify: Smartphone,
  bedrock_agentcore: Bot,
  s3_vectors: Compass,
  elasticache: Database,
  eks: Network,
  timestream: Clock,
  sagemaker: GraduationCap,
  rds_postgresql: Database,
}

export function ServiceCard({ type, name, description, selected, onClick }: ServiceCardProps) {
  const Icon = iconMap[type]

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
        >
          <Check className="h-3 w-3 text-primary-foreground" />
        </motion.div>
      )}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          selected ? "bg-primary/20" : "bg-muted"
        )}
      >
        <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div>
        <p className={cn("text-sm font-medium", selected && "text-primary")}>{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  )
}
