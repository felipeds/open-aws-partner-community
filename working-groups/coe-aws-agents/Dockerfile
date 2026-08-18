FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

ENV PORT=8080
ENV AGENTCORE_RUNTIME=true
EXPOSE 8080

# Use OpenTelemetry auto-instrumentation for AgentCore observability
CMD ["opentelemetry-instrument", "python", "backend/main.py"]
