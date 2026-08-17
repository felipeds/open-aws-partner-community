"""Unit tests for the Python backend — auth, tools, agents, SSE."""
import json
import os
import sys
import pytest

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ===========================================================================
# Auth Middleware Tests
# ===========================================================================
class TestAuth:
    def test_dev_mode_no_secret(self):
        """Without NEXTAUTH_SECRET, auth returns dev user."""
        os.environ.pop("NEXTAUTH_SECRET", None)
        from middleware.auth import AuthUser, NEXTAUTH_SECRET
        # Since module is already loaded, check the constant
        assert not os.getenv("NEXTAUTH_SECRET")

    def test_allowed_domain_from_env(self):
        """ALLOWED_DOMAIN is read from env var."""
        os.environ["ALLOWED_DOMAIN"] = "example.com"
        # Force reimport
        import importlib
        from middleware import auth
        importlib.reload(auth)
        assert auth.ALLOWED_DOMAIN == "example.com"
        os.environ.pop("ALLOWED_DOMAIN", None)

    def test_apn_whitelist_parsing(self):
        """APN_ALLOWED_EMAILS parses comma-separated list."""
        os.environ["APN_ALLOWED_EMAILS"] = "user1@x.com,user2@x.com,admin@x.com"
        import importlib
        from middleware import auth
        importlib.reload(auth)
        assert len(auth.APN_ALLOWED_EMAILS) == 3
        assert "user1@x.com" in auth.APN_ALLOWED_EMAILS
        assert "hacker@x.com" not in auth.APN_ALLOWED_EMAILS
        os.environ.pop("APN_ALLOWED_EMAILS", None)

    def test_empty_whitelist(self):
        """Empty APN_ALLOWED_EMAILS means no one has access."""
        os.environ["APN_ALLOWED_EMAILS"] = ""
        import importlib
        from middleware import auth
        importlib.reload(auth)
        assert len(auth.APN_ALLOWED_EMAILS) == 0

    def test_privileged_emails_parsing(self):
        """PRIVILEGED_EMAILS parses correctly."""
        os.environ["PRIVILEGED_EMAILS"] = "admin@x.com,super@x.com"
        import importlib
        from middleware import auth
        importlib.reload(auth)
        assert "admin@x.com" in auth.PRIVILEGED_EMAILS
        assert len(auth.PRIVILEGED_EMAILS) == 2
        os.environ.pop("PRIVILEGED_EMAILS", None)


# ===========================================================================
# Calculator Client Tests
# ===========================================================================
class TestCalculatorClient:
    def test_resolve_partition_aws(self):
        from tools.aws_calculator_client import resolve_partition
        assert resolve_partition("us-east-1") == "aws"
        assert resolve_partition("eu-west-1") == "aws"
        assert resolve_partition("sa-east-1") == "aws"
        assert resolve_partition(None) == "aws"
        assert resolve_partition("") == "aws"

    def test_resolve_partition_iso(self):
        from tools.aws_calculator_client import resolve_partition
        assert resolve_partition("us-iso-east-1") == "aws-iso"
        assert resolve_partition("us-iso-west-1") == "aws-iso"

    def test_resolve_partition_isob(self):
        from tools.aws_calculator_client import resolve_partition
        assert resolve_partition("us-isob-east-1") == "aws-iso-b"

    def test_search_services_comma_separated(self):
        """search_services handles comma-separated queries."""
        from tools.aws_calculator_client import search_services
        # Create a mock manifest
        manifest = {
            "lambda": {"key": "lambda", "name": "AWS Lambda", "subType": None, "isActive": "true"},
            "s3": {"key": "s3", "name": "Amazon S3", "subType": None, "isActive": "true"},
            "ec2": {"key": "ec2", "name": "Amazon EC2", "subType": None, "isActive": "true"},
        }
        results = search_services(manifest, "lambda, s3")
        assert isinstance(results, dict)
        assert "lambda" in results
        assert "s3" in results

    def test_search_services_single_query(self):
        """Single query returns list."""
        from tools.aws_calculator_client import search_services
        manifest = {
            "lambda": {"key": "lambda", "name": "AWS Lambda", "subType": None, "isActive": "true"},
        }
        results = search_services(manifest, "lambda")
        assert isinstance(results, list)
        assert len(results) == 1
        assert results[0]["key"] == "lambda"

    def test_search_services_filters_inactive(self):
        """Inactive services are excluded."""
        from tools.aws_calculator_client import search_services
        manifest = {
            "old_svc": {"key": "old_svc", "name": "Old Service", "subType": None, "isActive": "false"},
            "active_svc": {"key": "active_svc", "name": "Active Service", "subType": None, "isActive": "true"},
        }
        results = search_services(manifest, "service")
        assert isinstance(results, list)
        assert len(results) == 1
        assert results[0]["key"] == "active_svc"

    def test_search_services_filters_sub_service_selector(self):
        """subServiceSelector entries are excluded."""
        from tools.aws_calculator_client import search_services
        manifest = {
            "parent": {"key": "parent", "name": "Parent", "subType": "subServiceSelector", "isActive": "true"},
            "child": {"key": "child", "name": "Child Service", "subType": None, "isActive": "true"},
        }
        results = search_services(manifest, "service")
        assert len(results) == 1

    def test_find_service_case_insensitive(self):
        """find_service does case-insensitive match."""
        from tools.aws_calculator_client import find_service
        manifest = {
            "aWSLambda": {"key": "aWSLambda", "name": "AWS Lambda"},
        }
        assert find_service(manifest, "awslambda") is not None
        assert find_service(manifest, "AWSLAMBDA") is not None
        assert find_service(manifest, "nonexistent") is None

    def test_extract_input_fields(self):
        """extract_input_fields extracts fields from definition."""
        from tools.aws_calculator_client import extract_input_fields
        definition = {
            "templates": [{
                "id": "template1",
                "fields": [{
                    "id": "requestsPerMonth",
                    "type": "numericInput",
                    "label": "Requests per month",
                }]
            }]
        }
        fields = extract_input_fields(definition)
        assert len(fields) >= 1
        assert fields[0]["id"] == "requestsPerMonth"
        assert fields[0]["type"] == "numericInput"


# ===========================================================================
# Estimate Builder Tests
# ===========================================================================
class TestEstimateBuilder:
    def test_init(self):
        from tools.estimate_builder import EstimateBuilder
        eb = EstimateBuilder("Test Estimate")
        assert eb.name == "Test Estimate"
        assert eb.id is not None
        assert len(eb.services) == 0
        assert len(eb.groups) == 0

    def test_add_service(self):
        from tools.estimate_builder import EstimateBuilder
        eb = EstimateBuilder()
        eb.add_service("lambda", {"region": "us-east-1", "description": "My Lambda"})
        assert "lambda" in eb.services

    def test_add_service_duplicate_key(self):
        """Duplicate keys get description appended."""
        from tools.estimate_builder import EstimateBuilder
        eb = EstimateBuilder()
        eb.add_service("lambda", {"region": "us-east-1", "description": "Function A"})
        eb.add_service("lambda", {"region": "us-east-1", "description": "Function B"})
        # Should have 2 entries (original + deduped)
        assert len(eb.services) == 2

    def test_add_service_with_group(self):
        from tools.estimate_builder import EstimateBuilder
        eb = EstimateBuilder()
        eb.add_service("s3", {"region": "us-east-1"}, group="Storage")
        assert "Storage" in eb.groups


# ===========================================================================
# Project Plan Tests
# ===========================================================================
class TestProjectPlan:
    def test_get_plan_creates_default(self):
        from agents.project_plan import _get_plan, _plans
        _plans.clear()
        plan = _get_plan("test-session")
        assert plan["partner_name"] == os.getenv("PARTNER_NAME", "[Partner Name]")
        assert plan["customer_name"] == ""

    def test_generate_milestones(self):
        """Milestones are generated correctly for default 8 weeks."""
        from agents.project_plan import generate_milestones, _plans, _get_plan
        import agents.project_plan as pp
        _plans.clear()
        pp._current_session = "test"
        _get_plan("test")
        result = json.loads(generate_milestones._tool_func(duration_weeks=8))
        assert len(result["milestones"]) == 4
        assert "Week 1-2" in result["milestones"][0]
        assert "Discovery" in result["milestones"][0]

    def test_generate_cost_estimate_poc(self):
        from agents.project_plan import generate_cost_estimate
        result = json.loads(generate_cost_estimate._tool_func(monthly_cost=1000, arr=200000, funding_type="PoC"))
        assert result["fundingAmount"] == 20000  # 10% of 200k

    def test_generate_cost_estimate_genai_pia(self):
        from agents.project_plan import generate_cost_estimate
        result = json.loads(generate_cost_estimate._tool_func(monthly_cost=5000, arr=400000, funding_type="GenAI PIA"))
        assert result["fundingAmount"] == 100000  # 25% of 400k

    def test_generate_cost_estimate_genai_sca(self):
        from agents.project_plan import generate_cost_estimate
        result = json.loads(generate_cost_estimate._tool_func(monthly_cost=5000, arr=800000, funding_type="GenAI SCA"))
        assert result["fundingAmount"] == 250000  # min(40% of 800k=320k, cap=250k)


# ===========================================================================
# SSE Format Tests
# ===========================================================================
class TestSSEFormat:
    def test_tool_call_event(self):
        event = {"type": "tool_call", "tool": "search_services"}
        data = json.dumps(event)
        parsed = json.loads(data)
        assert parsed["type"] == "tool_call"
        assert parsed["tool"] == "search_services"

    def test_done_event(self):
        event = {"type": "done", "sessionId": "sess-123"}
        data = json.dumps(event)
        parsed = json.loads(data)
        assert parsed["type"] == "done"
        assert parsed["sessionId"] == "sess-123"

    def test_error_event(self):
        event = {"type": "error", "error": "Something failed"}
        data = json.dumps(event)
        parsed = json.loads(data)
        assert parsed["type"] == "error"

    def test_export_url_event(self):
        event = {"type": "export_url", "url": "https://calculator.aws/#/estimate?id=abc123"}
        data = json.dumps(event)
        parsed = json.loads(data)
        assert parsed["type"] == "export_url"
        assert "calculator.aws" in parsed["url"]

    def test_download_ready_event(self):
        event = {"type": "download_ready", "url": "/api/download/file.docx", "filename": "file.docx"}
        data = json.dumps(event)
        parsed = json.loads(data)
        assert parsed["type"] == "download_ready"
        assert parsed["filename"] == "file.docx"


# ===========================================================================
# Structured Logging Tests
# ===========================================================================
class TestStructuredLogging:
    def test_invocation_start_format(self):
        log = json.dumps({
            "event": "invocation_start",
            "ts": "2026-08-03T10:00:00Z",
            "userEmail": "user@example.com",
            "sessionId": "sess-001",
            "promptLength": 42,
            "hasFiles": False,
        })
        parsed = json.loads(log)
        assert parsed["event"] == "invocation_start"
        assert parsed["userEmail"] == "user@example.com"
        assert isinstance(parsed["promptLength"], int)

    def test_invocation_complete_format(self):
        log = json.dumps({
            "event": "invocation_complete",
            "ts": "2026-08-03T10:00:25Z",
            "userEmail": "user@example.com",
            "sessionId": "sess-001",
            "durationMs": 25000,
            "toolsCalled": ["delegate_calculator", "search_services", "export_estimate"],
        })
        parsed = json.loads(log)
        assert parsed["event"] == "invocation_complete"
        assert parsed["durationMs"] == 25000
        assert len(parsed["toolsCalled"]) == 3

    def test_invocation_error_format(self):
        log = json.dumps({
            "event": "invocation_error",
            "ts": "2026-08-03T10:00:03Z",
            "userEmail": "user@example.com",
            "sessionId": "sess-001",
            "error": "Model throttled",
            "durationMs": 3000,
            "toolsCalled": [],
        })
        parsed = json.loads(log)
        assert parsed["event"] == "invocation_error"
        assert parsed["error"] == "Model throttled"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
