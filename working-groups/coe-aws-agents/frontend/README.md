# AWS Cost Agent — Frontend

Next.js chat interface for the AWS Cost Agent. Users describe their architecture (free-form text or guided wizard) and the agent navigates the AWS Pricing Calculator in real time, returning a cost breakdown and shareable estimate link.

## Quick start

```bash
cd frontend

# Install dependencies
npm install   # or pnpm install

# Start dev server (requires backend running on :8000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prerequisites

The backend must be running before using the frontend:

```bash
cd backend && source .venv/bin/activate
AWS_PROFILE=coe_aws_pocs python -m src.api.server
```

See `backend/README.md` for backend setup.

## How it works

1. User describes their AWS architecture — either as free-form text or via the step-by-step wizard
2. The frontend POSTs to `/api/agent/run`, which proxies to the FastAPI backend at `localhost:8000/run`
3. The backend streams SSE events as it navigates the AWS Pricing Calculator
4. The UI updates in real time: pipeline steps animate, browser actions appear, and the result card renders when complete

## Input modes

**Free-form text** (`I have volumetry` toggle) — type a natural language description:
> "2 Lambda 512MB, 1M invocations/month, 200ms. S3 Standard 100GB. Bedrock Claude Sonnet 50k requests."

**Wizard** (`I don't have it` toggle) — 3-step guided flow:
1. Select services from the 13-service grid
2. Configure each service with dropdowns (volume, memory, duration, etc.)
3. Choose AWS region

## Supported services (wizard)

| Service | Type key |
|---|---|
| Lambda | `lambda` |
| S3 | `s3` |
| Amazon Bedrock | `bedrock` |
| API Gateway | `apigateway` |
| DynamoDB | `dynamodb` |
| SNS/SQS | `sns_sqs` |
| CloudFront | `cloudfront` |
| CloudWatch | `cloudwatch` |
| Cognito | `cognito` |
| Amazon SQS | `sqs` |
| AWS Amplify | `amplify` |
| Bedrock AgentCore | `bedrock_agentcore` |
| S3 Vectors | `s3_vectors` |

## Result card

When the agent completes, the result card shows:
- Yearly cost (bold, primary)
- Monthly cost (muted)
- Per-service cost breakdown
- Total row with both monthly and yearly values
- Shareable calculator.aws link (copy + open in browser)

## SSE event flow

The `useAgent` hook (`hooks/use-agent.ts`) consumes the SSE stream and maps events to UI state:

| Event | UI effect |
|---|---|
| `step_started` | Pipeline step turns active |
| `step_completed` | Pipeline step turns complete |
| `browser_action` | Current action label updates |
| `estimate_ready` | Result card renders |
| `error` | Error message in chat |

## Project structure

```
app/
├── page.tsx                    # Root page → renders AWSCostAgent
├── layout.tsx                  # Font, theme provider
├── globals.css
└── api/agent/run/route.ts      # SSE proxy → localhost:8000/run

components/aws-agent/
├── aws-cost-agent.tsx          # Main layout: chat + side panel
├── initial-state.tsx           # Landing: mode toggle + text input + wizard
├── service-selection-wizard.tsx # 3-step wizard
├── service-config-form.tsx     # Per-service config accordion
├── service-card.tsx            # Service selection card
├── chat-message.tsx            # User/agent message bubbles
├── pipeline-tracker.tsx        # Step-by-step progress sidebar
├── agent-status-panel.tsx      # Right sidebar: pipeline + stats
├── result-card.tsx             # Estimate result with costs and link
└── header.tsx                  # Logo + theme toggle

hooks/
├── use-agent.ts                # SSE consumer, state machine
└── use-mobile.ts

lib/
├── types.ts                    # ServiceType, EstimateResult, SERVICE_OPTIONS, AWS_SERVICES
└── utils.ts
```

## API route

`app/api/agent/run/route.ts` is a thin proxy — it forwards the POST body to `http://localhost:8000/run` and streams the SSE response back to the browser. No transformation, no buffering.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- Framer Motion (animations)
- Lucide React (icons)
- next-themes (dark/light mode)
