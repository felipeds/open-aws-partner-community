# Contributing to CoE AWS Agents

Thank you for your interest in contributing! This project is built by and for the AWS Partner community.

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce, expected vs. actual behavior
- For security issues, please email the maintainers directly instead of opening a public issue

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `cd backend-v2 && npm test`
5. Commit with a clear message: `git commit -m "feat: add new tool for X"`
6. Push and open a Pull Request

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests

### Code Guidelines

- **Backend**: Node.js ES modules, no TypeScript compilation required
- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Tests**: Use Node.js built-in test runner (`node:test`)
- **Formatting**: 2-space indentation, single quotes, no semicolons in JS (follow existing style)
- **Environment**: All configuration via environment variables (never hardcode credentials or internal values)

### Adding a New Agent

1. Create `backend-v2/src/agents/my-agent.js` with the agent logic
2. Create `backend-v2/src/tools/my-agent-tools.js` with tool definitions
3. Add routing in `agents/orchestrator.js`
4. Add tests in `backend-v2/test/`
5. Document the agent and its tools in the README

### Adding a New Tool to an Existing Agent

1. Add the tool spec to the agent's `toolConfig`
2. Implement the handler in the tools file
3. Add tests
4. Document in README

## Development Setup

```bash
# Backend
cd backend-v2
npm install
node src/server.js  # Runs in local mode without NEXTAUTH_SECRET

# Frontend
cd frontend
npm install
npm run dev
```

Without `NEXTAUTH_SECRET`, the backend runs in dev mode (no auth required).

## Project Structure

```
backend-v2/
├── src/
│   ├── server.js              # Express server (proxy + runtime modes)
│   ├── session-store.js       # In-memory session management
│   ├── tracing.js             # OpenTelemetry instrumentation
│   ├── middleware/auth.js     # JWT auth + whitelist
│   ├── agents/                # Agent definitions (orchestrator, calculator, project-plan, apn)
│   ├── tools/                 # Tool implementations
│   └── templates/             # Document templates
├── test/                      # Unit and integration tests
└── generated/                 # Generated documents (gitignored)

frontend/
├── app/                       # Next.js app router pages
├── components/aws-agent/      # Chat UI components
└── hooks/                     # React hooks (SSE, auth)
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
