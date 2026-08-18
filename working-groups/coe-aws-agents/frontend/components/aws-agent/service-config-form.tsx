"use client"

import { Zap, Database, Brain, Globe, Box, Bell, Cloud, BarChart2, Shield, MessageSquare, Smartphone, Bot, Compass, Network, Clock, GraduationCap } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SERVICE_OPTIONS } from "@/lib/types"
import type { ServiceType, ServiceConfig } from "@/lib/types"

interface ServiceConfigFormProps {
  services: ServiceType[]
  configs: Record<string, ServiceConfig>
  onConfigChange: (serviceType: ServiceType, config: Record<string, string | number | string[]>) => void
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

const serviceNames: Record<ServiceType, string> = {
  lambda: "Lambda",
  s3: "S3",
  bedrock: "Bedrock",
  apigateway: "API Gateway",
  dynamodb: "DynamoDB",
  sns_sqs: "SNS/SQS",
  cloudfront: "CloudFront",
  cloudwatch: "CloudWatch",
  cognito: "Cognito",
  sqs: "Amazon SQS",
  amplify: "AWS Amplify",
  bedrock_agentcore: "Bedrock AgentCore",
  s3_vectors: "S3 Vectors",
  elasticache: "Amazon ElastiCache",
  eks: "Amazon EKS",
  timestream: "Amazon Timestream",
  sagemaker: "Amazon SageMaker",
  rds_postgresql: "Amazon RDS PostgreSQL",
}

export function ServiceConfigForm({ services, configs, onConfigChange }: ServiceConfigFormProps) {
  const updateConfig = (
    serviceType: ServiceType,
    key: string,
    value: string | number | string[]
  ) => {
    const currentConfig = configs[serviceType]?.config || {}
    onConfigChange(serviceType, { ...currentConfig, [key]: value })
  }

  const getConfigCount = (serviceType: ServiceType) => {
    const config = configs[serviceType]?.config || {}
    return Object.keys(config).length
  }

  return (
    <Accordion type="multiple" className="space-y-2" defaultValue={services}>
      {services.map((serviceType) => {
        const Icon = iconMap[serviceType]
        const config = configs[serviceType]?.config || {}

        return (
          <AccordionItem
            key={serviceType}
            value={serviceType}
            className="rounded-lg border border-border bg-card px-4"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{serviceNames[serviceType]}</span>
                {getConfigCount(serviceType) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {getConfigCount(serviceType)} configs
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {serviceType === "lambda" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Scale (invocations/mo)</Label>
                      <Select
                        value={config.porte as string}
                        onValueChange={(v) => updateConfig(serviceType, "porte", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.lambda.porte.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Memory</Label>
                      <Select
                        value={config.memoria as string}
                        onValueChange={(v) => updateConfig(serviceType, "memoria", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.lambda.memoria.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Average duration</Label>
                      <Select
                        value={config.duracao as string}
                        onValueChange={(v) => updateConfig(serviceType, "duracao", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.lambda.duracao.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Number of functions</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={config.quantidade as number || 1}
                        onChange={(e) => updateConfig(serviceType, "quantidade", parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </>
                )}

                {serviceType === "s3" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Data volume</Label>
                      <Select
                        value={config.volume as string}
                        onValueChange={(v) => updateConfig(serviceType, "volume", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.s3.volume.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Storage class</Label>
                      <Select
                        value={config.classe as string}
                        onValueChange={(v) => updateConfig(serviceType, "classe", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.s3.classe.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs">Access pattern</Label>
                      <Select
                        value={config.padrao_acesso as string}
                        onValueChange={(v) => updateConfig(serviceType, "padrao_acesso", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.s3.padrao_acesso.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "bedrock" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Model</Label>
                      <Select
                        value={config.modelo as string}
                        onValueChange={(v) => updateConfig(serviceType, "modelo", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock.modelo.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Request volume</Label>
                      <Select
                        value={config.volume_requests as string}
                        onValueChange={(v) => updateConfig(serviceType, "volume_requests", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock.volume_requests.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Average input size</Label>
                      <Select
                        value={config.tamanho_input as string}
                        onValueChange={(v) => updateConfig(serviceType, "tamanho_input", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock.tamanho_input.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Average output size</Label>
                      <Select
                        value={config.tamanho_output as string}
                        onValueChange={(v) => updateConfig(serviceType, "tamanho_output", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock.tamanho_output.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "apigateway" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={config.tipo as string}
                        onValueChange={(v) => updateConfig(serviceType, "tipo", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.apigateway.tipo.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Request volume</Label>
                      <Select
                        value={config.volume_requests as string}
                        onValueChange={(v) => updateConfig(serviceType, "volume_requests", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.apigateway.volume_requests.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs">Average payload size</Label>
                      <Select
                        value={config.tamanho_payload as string}
                        onValueChange={(v) => updateConfig(serviceType, "tamanho_payload", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.apigateway.tamanho_payload.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "dynamodb" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Capacity mode</Label>
                      <Select
                        value={config.modo_capacidade as string}
                        onValueChange={(v) => updateConfig(serviceType, "modo_capacidade", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.dynamodb.modo_capacidade.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Storage</Label>
                      <Select
                        value={config.armazenamento as string}
                        onValueChange={(v) => updateConfig(serviceType, "armazenamento", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.dynamodb.armazenamento.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Reads/mo</Label>
                      <Select
                        value={config.leituras as string}
                        onValueChange={(v) => updateConfig(serviceType, "leituras", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.dynamodb.leituras.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Writes/mo</Label>
                      <Select
                        value={config.escritas as string}
                        onValueChange={(v) => updateConfig(serviceType, "escritas", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.dynamodb.escritas.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "sns_sqs" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Messages/mo</Label>
                      <Select
                        value={config.mensagens as string}
                        onValueChange={(v) => updateConfig(serviceType, "mensagens", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.sns_sqs.mensagens.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={config.tipo as string}
                        onValueChange={(v) => updateConfig(serviceType, "tipo", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.sns_sqs.tipo.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "cloudfront" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Monthly traffic</Label>
                      <Select
                        value={config.trafego as string}
                        onValueChange={(v) => updateConfig(serviceType, "trafego", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.cloudfront.trafego.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Primary region</Label>
                      <Select
                        value={config.regiao as string}
                        onValueChange={(v) => updateConfig(serviceType, "regiao", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.cloudfront.regiao.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "cloudwatch" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Custom metrics</Label>
                      <Select
                        value={config.metricas_custom as string}
                        onValueChange={(v) => updateConfig(serviceType, "metricas_custom", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.cloudwatch.metricas_custom.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Logs ingested/mo</Label>
                      <Select
                        value={config.logs as string}
                        onValueChange={(v) => updateConfig(serviceType, "logs", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.cloudwatch.logs.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "cognito" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">MAU (monthly active users)</Label>
                      <Select
                        value={config.mau as string}
                        onValueChange={(v) => updateConfig(serviceType, "mau", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.cognito.mau.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-xs">Features</Label>
                      <div className="flex flex-wrap gap-4 pt-1">
                        {SERVICE_OPTIONS.cognito.features.map((opt) => {
                          const features = (config.features as string[]) || []
                          const isChecked = features.includes(opt.value)
                          return (
                            <div key={opt.value} className="flex items-center gap-2">
                              <Checkbox
                                id={`cognito-${opt.value}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newFeatures = checked
                                    ? [...features, opt.value]
                                    : features.filter((f) => f !== opt.value)
                                  updateConfig(serviceType, "features", newFeatures)
                                }}
                              />
                              <Label
                                htmlFor={`cognito-${opt.value}`}
                                className="text-xs font-normal"
                              >
                                {opt.label}
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {serviceType === "sqs" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Mensagens/mês</Label>
                      <Select
                        value={config.mensagens as string}
                        onValueChange={(v) => updateConfig(serviceType, "mensagens", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.sqs.mensagens.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo</Label>
                      <Select
                        value={config.tipo as string}
                        onValueChange={(v) => updateConfig(serviceType, "tipo", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.sqs.tipo.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "amplify" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Build minutes/mês</Label>
                      <Select
                        value={config.build_minutes as string}
                        onValueChange={(v) => updateConfig(serviceType, "build_minutes", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.amplify.build_minutes.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Storage (GB)</Label>
                      <Select
                        value={config.storage_gb as string}
                        onValueChange={(v) => updateConfig(serviceType, "storage_gb", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.amplify.storage_gb.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Transfer (GB)</Label>
                      <Select
                        value={config.data_transfer_gb as string}
                        onValueChange={(v) => updateConfig(serviceType, "data_transfer_gb", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.amplify.data_transfer_gb.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "bedrock_agentcore" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Agent sessions/mês</Label>
                      <Select
                        value={config.agent_sessions as string}
                        onValueChange={(v) => updateConfig(serviceType, "agent_sessions", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock_agentcore.agent_sessions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Browser sessions/mês</Label>
                      <Select
                        value={config.browser_sessions as string}
                        onValueChange={(v) => updateConfig(serviceType, "browser_sessions", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.bedrock_agentcore.browser_sessions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {serviceType === "s3_vectors" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs">Vetores armazenados</Label>
                      <Select
                        value={config.vectors_stored as string}
                        onValueChange={(v) => updateConfig(serviceType, "vectors_stored", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.s3_vectors.vectors_stored.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Queries/mês</Label>
                      <Select
                        value={config.queries_per_month as string}
                        onValueChange={(v) => updateConfig(serviceType, "queries_per_month", v)}
                      >
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.s3_vectors.queries_per_month.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
