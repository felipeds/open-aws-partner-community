# CoE AWS Agents

Conversational AI agents that help AWS Partners with day-to-day tasks: creating cost estimates, building project plans, and querying Partner Central — all through natural language.

## What It Does

| Agent | Description |
|-------|-------------|
| 💰 **Calculator Agent** | Creates AWS Pricing Calculator estimates via conversation, returns shareable links |
| 📄 **Project Plan Agent** | Generates or validates PoC Project Plan documents (.docx) |
| 🤝 **APN Agent** | Queries AWS Partner Central — opportunities, fundings, pipeline analysis |

All agents are orchestrated by a single entry point that routes requests based on user intent.

## Architecture

```
User → Frontend (Next.js)
         ↓ POST /api/chat (SSE)
       Backend (Node.js + Express)
         ↓
       Orchestrator Agent (Claude Sonnet via Bedrock)
         ├── Calculator Agent → calculator.aws API → shareable link
         ├── Project Plan Agent → .docx generation
         └── APN Agent → Partner Central SDK + MCP
```

Optional: Deploy agents to **Amazon Bedrock AgentCore Runtime** for managed scaling, session isolation, and CloudWatch observability.

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 22+ (for frontend)
- AWS account with Bedrock access (Claude Sonnet model enabled)
- Google OAuth credentials (optional — for authentication)

### 1. Clone and configure

```bash
git clone <repo-url>
cd coe-aws-agents
cp .env.example .env
# Edit .env with your values (see Configuration section below)
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
AWS_PROFILE=<your-profile> python main.py
# → http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Configuration

All configuration is via environment variables. See `.env.example` for the complete list.

### Required (minimum to run)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL (default: `http://localhost:3001`) |

> **Note:** The app works without authentication. Google OAuth is optional — configure it only if you want to restrict access.

### Authentication (optional)

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random string for JWT signing (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Access Control

| Variable | Description |
|----------|-------------|
| `ALLOWED_DOMAIN` | Restrict login to email domain (e.g. `yourcompany.com`). Leave empty for no restriction |
| `APN_ALLOWED_EMAILS` | Comma-separated emails with Partner Central access |
| `PRIVILEGED_EMAILS` | Comma-separated emails with elevated access |

### AWS Partner Central (optional)

| Variable | Description |
|----------|-------------|
| `APN_ACCESS_KEY_ID` | IAM user credentials with `partnercentral-selling` permissions |
| `APN_SECRET_ACCESS_KEY` | Corresponding secret key |
| `APN_MCP_ENDPOINT` | MCP endpoint (default: `https://partnercentral-agents-mcp.us-east-1.api.aws`) |

### AgentCore Runtime (optional — enables observability)

| Variable | Description |
|----------|-------------|
| `AGENTCORE_RUNTIME_ARN` | Runtime ARN. If set, agents execute in AgentCore with automatic CloudWatch logs |
| `AWS_REGION` | AWS region (default: `us-east-1`) |

### Document Generation

| Variable | Description |
|----------|-------------|
| `PARTNER_NAME` | Your company name (used in generated project plan documents) |

## Agent Tools

### Calculator Agent
| Tool | Description |
|------|-------------|
| `search_services` | Find AWS services by name |
| `get_service_fields` | Get configuration fields for a service |
| `create_estimate` | Create a new empty estimate |
| `add_service` | Add services with configuration |
| `export_estimate` | Export and get shareable calculator.aws link |
| `import_estimate` | Import existing estimate by URL/ID |

### Project Plan Agent
| Tool | Description |
|------|-------------|
| `collect_info` | Store project plan information |
| `generate_milestones` | Create project milestones |
| `generate_cost_estimate` | Calculate funding-aware cost breakdown |
| `generate_document` | Generate .docx from collected info |
| `validate_document` | Check uploaded .docx for completeness |

### APN Agent
| Tool | Description |
|------|-------------|
| `list_opportunities` | List Partner Central opportunities |
| `get_opportunity` | Get opportunity details |
| `get_aws_opportunity_summary` | Get AWS-side view of an opportunity |
| `list_funding_applications` | List funding/benefit applications |
| `get_funding_details` | Get funding application details |
| `send_mcp_message` | Advanced queries via MCP (sales plays, pipeline analysis) |

## Tests

```bash
cd backend
pip install pytest
python -m pytest tests/ -v              # All unit tests (31)
```

## Deployment

### Option A: App Runner (simple)

```bash
# Build and push Docker image
docker build -t my-agent .
docker tag my-agent:latest <account>.dkr.ecr.<region>.amazonaws.com/my-agent:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/my-agent:latest

# Create App Runner service pointing to the ECR image
# Configure env vars in App Runner console
```

### Option B: AgentCore Runtime (observability + managed scaling)

```bash
# Build ARM64 image
docker buildx build --platform linux/arm64 -f Dockerfile.agentcore \
  -t <account>.dkr.ecr.<region>.amazonaws.com/my-agent-agentcore:latest --push .

# Create runtime
aws bedrock-agentcore-control create-agent-runtime \
  --agent-runtime-name my_agent \
  --agent-runtime-artifact '{"containerConfiguration":{"containerUri":"<ecr-uri>"}}' \
  --role-arn <execution-role-arn> \
  --network-configuration '{"networkMode":"PUBLIC"}' \
  --protocol-configuration '{"serverProtocol":"HTTP"}' \
  --region <region>
```

Required IAM permissions for the execution role:
- `bedrock:InvokeModel`, `bedrock:InvokeModelWithResponseStream`
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`
- `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`, `ecr:GetAuthorizationToken`

### Frontend (Amplify)

Push to a connected branch. Amplify auto-deploys on push.

**Important**: For SSR, create `.env.production` during preBuild:
```yaml
preBuild:
  commands:
    - npm ci
    - echo "NEXTAUTH_URL=$NEXTAUTH_URL" >> .env.production
    - echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env.production
    - echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env.production
    - echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> .env.production
    - echo "NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL" >> .env.production
```

## Key Features

- **Multi-turn conversation** — add/modify services incrementally
- **436+ AWS services** supported via live service definitions
- **Real-time progress** — UI shows each tool call as it happens
- **No AWS credentials needed** for cost estimate generation (uses public calculator API)
- **Session persistence** — estimate state maintained across messages
- **Automatic fallback** — if AgentCore is unavailable, agents run locally

## Tech Stack

- **LLM**: Claude Sonnet via Amazon Bedrock Converse API
- **Agent Framework**: [Strands Agents](https://strandsagents.com/) (Python)
- **Backend**: Python + FastAPI + SSE
- **Frontend**: Next.js + Tailwind + react-markdown
- **Calculator API**: [sample-aws-pricing-calculator-mcp](https://github.com/aws-samples/sample-aws-pricing-calculator-mcp)
- **Auth**: NextAuth.js + Google OAuth
- **Runtime** (optional): Amazon Bedrock AgentCore

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
