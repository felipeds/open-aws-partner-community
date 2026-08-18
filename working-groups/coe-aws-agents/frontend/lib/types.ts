export type AgentState = "idle" | "running" | "complete" | "error"

export type ServiceType = 
  | "lambda" 
  | "s3" 
  | "bedrock" 
  | "apigateway" 
  | "dynamodb" 
  | "sns_sqs" 
  | "cloudfront" 
  | "cloudwatch" 
  | "cognito"
  | "sqs"
  | "amplify"
  | "bedrock_agentcore"
  | "s3_vectors"
  | "elasticache"
  | "eks"
  | "timestream"
  | "sagemaker"
  | "rds_postgresql"

export interface ServiceConfig {
  type: ServiceType
  config: Record<string, string | number | string[]>
}

export interface Message {
  id: string
  role: "user" | "agent"
  content: string
  timestamp: Date
  image?: string        // base64 data URL for image attachments
  fileName?: string     // name of non-image attachment
}

export interface PipelineStep {
  id: number
  title: string
  description: string
  status: "pending" | "active" | "complete" | "error"
}

export interface EstimateResult {
  total: number
  breakdown: {
    service: string
    cost: number
    quantity?: number
  }[]
  link: string
  assumptions: {
    field: string
    assumed_value: unknown
    reason: string
  }[]
  warnings: {
    code: string
    message: string
    service?: string | null
  }[]
  stats: {
    browserSessions: number
    actionsExecuted: number
    totalTime: string
    services: number
  }
}

export interface ServiceDefinition {
  type: ServiceType
  name: string
  icon: string
  description: string
}

export const AWS_SERVICES: ServiceDefinition[] = [
  { type: "lambda", name: "Lambda", icon: "function", description: "Serverless compute" },
  { type: "s3", name: "S3", icon: "bucket", description: "Storage & hosting" },
  { type: "bedrock", name: "Bedrock", icon: "brain", description: "AI/ML Foundation" },
  { type: "apigateway", name: "API Gateway", icon: "globe", description: "REST & HTTP APIs" },
  { type: "dynamodb", name: "DynamoDB", icon: "database", description: "NoSQL DB" },
  { type: "sns_sqs", name: "SNS/SQS", icon: "bell", description: "Messaging" },
  { type: "cloudfront", name: "CloudFront", icon: "cloud", description: "CDN" },
  { type: "cloudwatch", name: "CloudWatch", icon: "chart", description: "Monitoring" },
  { type: "cognito", name: "Cognito", icon: "shield", description: "Auth" },
  { type: "sqs", name: "Amazon SQS", icon: "message", description: "Filas de mensagens" },
  { type: "amplify", name: "AWS Amplify", icon: "smartphone", description: "Hosting & CI/CD" },
  { type: "bedrock_agentcore", name: "Bedrock AgentCore", icon: "bot", description: "AI agent runtime" },
  { type: "s3_vectors", name: "S3 Vectors", icon: "compass", description: "Vector storage & search" },
  { type: "elasticache", name: "Amazon ElastiCache", icon: "database", description: "Cache in-memory" },
  { type: "eks", name: "Amazon EKS", icon: "container", description: "Kubernetes gerenciado" },
  { type: "timestream", name: "Amazon Timestream", icon: "clock", description: "Banco de dados temporal" },
  { type: "sagemaker", name: "Amazon SageMaker", icon: "brain", description: "ML training & inference" },
  { type: "rds_postgresql", name: "Amazon RDS PostgreSQL", icon: "database", description: "Banco relacional gerenciado" },
]

// Service configuration options
export const SERVICE_OPTIONS = {
  lambda: {
    porte: [
      { value: "leve", label: "Light (< 100K inv/mo)", numeric: 50000 },
      { value: "medio", label: "Medium (100K-1M)", numeric: 500000 },
      { value: "alto", label: "High (1M-10M)", numeric: 5000000 },
      { value: "muito_alto", label: "Very high (10M+)", numeric: 15000000 },
    ],
    memoria: [
      { value: "128", label: "128MB" },
      { value: "256", label: "256MB" },
      { value: "512", label: "512MB" },
      { value: "1024", label: "1024MB" },
      { value: "2048", label: "2048MB" },
    ],
    duracao: [
      { value: "rapida", label: "Fast (< 100ms)", numeric: 50 },
      { value: "media", label: "Medium (100-500ms)", numeric: 300 },
      { value: "longa", label: "Long (500ms-1s)", numeric: 750 },
      { value: "muito_longa", label: "Very long (> 1s)", numeric: 1500 },
    ],
  },
  s3: {
    volume: [
      { value: "pequeno", label: "Small (< 10GB)", numeric: 5 },
      { value: "medio", label: "Medium (10-100GB)", numeric: 50 },
      { value: "grande", label: "Large (100GB-1TB)", numeric: 500 },
      { value: "muito_grande", label: "Very large (> 1TB)", numeric: 2000 },
    ],
    classe: [
      { value: "standard", label: "Standard" },
      { value: "intelligent", label: "Intelligent-Tiering" },
      { value: "glacier", label: "Glacier" },
      { value: "glacier_deep", label: "Glacier Deep Archive" },
    ],
    padrao_acesso: [
      { value: "leitura", label: "Read-intensive" },
      { value: "escrita", label: "Write-intensive" },
      { value: "balanceado", label: "Balanced" },
      { value: "arquivamento", label: "Archival" },
    ],
  },
  bedrock: {
    modelo: [
      { value: "claude_sonnet", label: "Claude Sonnet" },
      { value: "claude_haiku", label: "Claude Haiku" },
      { value: "claude_opus", label: "Claude Opus" },
      { value: "nova_micro", label: "Nova Micro" },
      { value: "nova_lite", label: "Nova Lite" },
      { value: "nova_pro", label: "Nova Pro" },
      { value: "titan_text", label: "Titan Text" },
    ],
    volume_requests: [
      { value: "baixo", label: "Low (< 10K/mo)", numeric: 5000 },
      { value: "medio", label: "Medium (10K-100K)", numeric: 50000 },
      { value: "alto", label: "High (100K-1M)", numeric: 500000 },
      { value: "muito_alto", label: "Very high (> 1M)", numeric: 2000000 },
    ],
    tamanho_input: [
      { value: "curto", label: "Short (< 500 tokens)", numeric: 250 },
      { value: "medio", label: "Medium (500-2K tokens)", numeric: 1000 },
      { value: "longo", label: "Long (2K-8K tokens)", numeric: 4000 },
      { value: "muito_longo", label: "Very long (> 8K tokens)", numeric: 12000 },
    ],
    tamanho_output: [
      { value: "curto", label: "Short (< 200 tokens)", numeric: 100 },
      { value: "medio", label: "Medium (200-1K tokens)", numeric: 500 },
      { value: "longo", label: "Long (1K-4K tokens)", numeric: 2000 },
    ],
  },
  apigateway: {
    tipo: [
      { value: "rest", label: "REST API" },
      { value: "http", label: "HTTP API" },
      { value: "websocket", label: "WebSocket" },
    ],
    volume_requests: [
      { value: "baixo", label: "Low (< 100K/mo)", numeric: 50000 },
      { value: "medio", label: "Medium (100K-1M)", numeric: 500000 },
      { value: "alto", label: "High (1M-10M)", numeric: 5000000 },
      { value: "muito_alto", label: "Very high (> 10M)", numeric: 20000000 },
    ],
    tamanho_payload: [
      { value: "pequeno", label: "Small (< 1KB)" },
      { value: "medio", label: "Medium (1-10KB)" },
      { value: "grande", label: "Large (10-100KB)" },
    ],
  },
  dynamodb: {
    modo_capacidade: [
      { value: "on_demand", label: "On-demand" },
      { value: "provisioned", label: "Provisioned" },
    ],
    leituras: [
      { value: "baixo", label: "Low (< 1M)", numeric: 500000 },
      { value: "medio", label: "Medium (1M-10M)", numeric: 5000000 },
      { value: "alto", label: "High (> 10M)", numeric: 20000000 },
    ],
    escritas: [
      { value: "baixo", label: "Low (< 1M)", numeric: 500000 },
      { value: "medio", label: "Medium (1M-10M)", numeric: 5000000 },
      { value: "alto", label: "High (> 10M)", numeric: 20000000 },
    ],
    armazenamento: [
      { value: "10gb", label: "< 10GB", numeric: 5 },
      { value: "100gb", label: "10-100GB", numeric: 50 },
      { value: "1tb", label: "100GB-1TB", numeric: 500 },
      { value: "1tb_plus", label: "> 1TB", numeric: 2000 },
    ],
  },
  sns_sqs: {
    mensagens: [
      { value: "1m", label: "< 1M", numeric: 500000 },
      { value: "10m", label: "1M-10M", numeric: 5000000 },
      { value: "100m", label: "10M-100M", numeric: 50000000 },
      { value: "100m_plus", label: "> 100M", numeric: 200000000 },
    ],
    tipo: [
      { value: "standard", label: "Standard" },
      { value: "fifo", label: "FIFO" },
    ],
  },
  cloudfront: {
    trafego: [
      { value: "100gb", label: "< 100GB", numeric: 50 },
      { value: "1tb", label: "100GB-1TB", numeric: 500 },
      { value: "10tb", label: "1TB-10TB", numeric: 5000 },
      { value: "10tb_plus", label: "> 10TB", numeric: 20000 },
    ],
    regiao: [
      { value: "us_europe", label: "US/Europe" },
      { value: "south_america", label: "South America" },
      { value: "asia_pacific", label: "Asia Pacific" },
      { value: "global", label: "Global" },
    ],
  },
  cloudwatch: {
    metricas_custom: [
      { value: "10", label: "< 10", numeric: 5 },
      { value: "50", label: "10-50", numeric: 30 },
      { value: "200", label: "50-200", numeric: 100 },
      { value: "200_plus", label: "> 200", numeric: 300 },
    ],
    logs: [
      { value: "5gb", label: "< 5GB", numeric: 2 },
      { value: "50gb", label: "5-50GB", numeric: 25 },
      { value: "500gb", label: "50-500GB", numeric: 200 },
      { value: "500gb_plus", label: "> 500GB", numeric: 1000 },
    ],
  },
  cognito: {
    mau: [
      { value: "50k", label: "< 50K (free tier)", numeric: 25000 },
      { value: "100k", label: "50K-100K", numeric: 75000 },
      { value: "1m", label: "100K-1M", numeric: 500000 },
      { value: "1m_plus", label: "> 1M", numeric: 2000000 },
    ],
    features: [
      { value: "signin", label: "Sign-up/Sign-in" },
      { value: "mfa", label: "MFA" },
      { value: "social", label: "Social login" },
      { value: "saml", label: "SAML/OIDC" },
    ],
  },
  sqs: {
    mensagens: [
      { value: "1m", label: "< 1M", numeric: 500000 },
      { value: "10m", label: "1M-10M", numeric: 5000000 },
      { value: "100m", label: "10M-100M", numeric: 50000000 },
      { value: "100m_plus", label: "> 100M", numeric: 200000000 },
    ],
    tipo: [
      { value: "standard", label: "Standard" },
      { value: "fifo", label: "FIFO" },
    ],
  },
  amplify: {
    build_minutes: [
      { value: "100", label: "100 min/mês" },
      { value: "500", label: "500 min/mês" },
      { value: "1000", label: "1.000 min/mês" },
      { value: "5000", label: "5.000 min/mês" },
    ],
    storage_gb: [
      { value: "10", label: "10 GB" },
      { value: "50", label: "50 GB" },
      { value: "100", label: "100 GB" },
      { value: "500", label: "500 GB" },
    ],
    data_transfer_gb: [
      { value: "10", label: "10 GB" },
      { value: "50", label: "50 GB" },
      { value: "100", label: "100 GB" },
      { value: "500", label: "500 GB" },
    ],
  },
  bedrock_agentcore: {
    agent_sessions: [
      { value: "1000", label: "1.000 sessões/mês" },
      { value: "10000", label: "10.000 sessões/mês" },
      { value: "50000", label: "50.000 sessões/mês" },
      { value: "100000", label: "100.000 sessões/mês" },
    ],
    browser_sessions: [
      { value: "100", label: "100 sessões/mês" },
      { value: "1000", label: "1.000 sessões/mês" },
      { value: "5000", label: "5.000 sessões/mês" },
      { value: "10000", label: "10.000 sessões/mês" },
    ],
  },
  s3_vectors: {
    vectors_stored: [
      { value: "100000", label: "100K vetores" },
      { value: "1000000", label: "1M vetores" },
      { value: "10000000", label: "10M vetores" },
      { value: "100000000", label: "100M vetores" },
    ],
    queries_per_month: [
      { value: "10000", label: "10K queries/mês" },
      { value: "100000", label: "100K queries/mês" },
      { value: "1000000", label: "1M queries/mês" },
      { value: "10000000", label: "10M queries/mês" },
    ],
  },
  elasticache: {
    nodes: [
      { value: "1", label: "1 nó" },
      { value: "3", label: "3 nós" },
      { value: "5", label: "5 nós" },
      { value: "10", label: "10 nós" },
    ],
    node_type: [
      { value: "cache.t3.micro", label: "cache.t3.micro" },
      { value: "cache.t3.medium", label: "cache.t3.medium" },
      { value: "cache.r6g.large", label: "cache.r6g.large" },
      { value: "cache.r6g.xlarge", label: "cache.r6g.xlarge" },
    ],
  },
  eks: {
    clusters: [
      { value: "1", label: "1 cluster" },
      { value: "2", label: "2 clusters" },
      { value: "5", label: "5 clusters" },
    ],
    worker_nodes: [
      { value: "3", label: "3 nós" },
      { value: "5", label: "5 nós" },
      { value: "10", label: "10 nós" },
      { value: "20", label: "20 nós" },
    ],
  },
  timestream: {
    writes_per_second: [
      { value: "100", label: "100/s" },
      { value: "1000", label: "1.000/s" },
      { value: "5000", label: "5.000/s" },
      { value: "10000", label: "10.000/s" },
    ],
    storage_gb: [
      { value: "10", label: "10 GB" },
      { value: "50", label: "50 GB" },
      { value: "100", label: "100 GB" },
      { value: "500", label: "500 GB" },
    ],
  },
  sagemaker: {
    training_hours: [
      { value: "10", label: "10 horas/mês" },
      { value: "50", label: "50 horas/mês" },
      { value: "100", label: "100 horas/mês" },
      { value: "500", label: "500 horas/mês" },
    ],
    instance_type: [
      { value: "ml.t3.medium", label: "ml.t3.medium" },
      { value: "ml.m5.xlarge", label: "ml.m5.xlarge" },
      { value: "ml.p3.2xlarge", label: "ml.p3.2xlarge" },
      { value: "ml.g5.xlarge", label: "ml.g5.xlarge" },
    ],
  },
  rds_postgresql: {
    instance_type: [
      { value: "db.t3.micro", label: "db.t3.micro" },
      { value: "db.t3.medium", label: "db.t3.medium" },
      { value: "db.r6g.large", label: "db.r6g.large" },
      { value: "db.r6g.xlarge", label: "db.r6g.xlarge" },
    ],
    storage_gb: [
      { value: "20", label: "20 GB" },
      { value: "50", label: "50 GB" },
      { value: "100", label: "100 GB" },
      { value: "500", label: "500 GB" },
      { value: "1000", label: "1 TB" },
    ],
    multi_az: [
      { value: "Sim", label: "Sim (Multi-AZ)" },
      { value: "Não", label: "Não (Single-AZ)" },
    ],
  },
} as const

export const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia) - cheapest" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "sa-east-1", label: "South America (São Paulo) - nearest" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
]


