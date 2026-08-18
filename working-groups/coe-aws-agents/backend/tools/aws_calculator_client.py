"""
AWS Calculator Client — Python port of aws-client.js
Uses httpx.AsyncClient for HTTP requests.
"""

import json
from typing import Optional

import httpx

# ─── Constants ───────────────────────────────────────────────────────────────

SAVE_URL = "https://dnd5zrqcec4or.cloudfront.net/Prod/v2/saveAs"
CDN_BASE = "https://d1qsjq9pzbk1k6.cloudfront.net"
READ_URL = "https://d3knqfixx3sbls.cloudfront.net"
METADATA_CDN = "https://calculator.aws"

PARTITIONS = {
    "aws": {
        "manifestPath": "/manifest/en_US.json",
        "cdnPrefix": "",
        "contract": None,
        "awsPartition": "aws",
        "regions": {},
    },
    "aws-iso": {
        "manifestPath": "/aws-iso/manifest/en_US.json",
        "cdnPrefix": "/aws-iso",
        "contract": "5423f8cd3b711c6f899ba4dade31b50c",
        "awsPartition": "aws-iso",
        "regions": {
            "us-iso-east-1": "US ISO East",
            "us-iso-west-1": "US ISO West",
        },
    },
    "aws-iso-b": {
        "manifestPath": "/aws-iso-b/manifest/en_US.json",
        "cdnPrefix": "/aws-iso-b",
        "contract": "5423f8cd3b711c6f899ba4dade31b50c",
        "awsPartition": "aws-iso-b",
        "regions": {
            "us-isob-east-1": "US ISOB East (Ohio)",
        },
    },
}

REGIONS = {
    "us-iso-east-1": "aws-iso",
    "us-iso-west-1": "aws-iso",
    "us-isob-east-1": "aws-iso-b",
}

INPUT_TYPES = {"input", "numericInput", "frequency", "fileSize", "durationInput", "percentInput"}
INPUT_SUBTYPES = {"dropdown", "numericInput", "frequency", "fileSize", "durationInput", "columnFormIPM", "dataTransferV2"}

COLUMN_FORM_IPM_VALUE_SHAPE = (
    'columnFormIPM expects {value: [rowObject]} — an array of one or more row objects. '
    'Each row is keyed by the selectorId (or label where no selectorId is defined; '
    'the utilization row uses the literal key "undefined"). Every cell wraps its value as '
    '{value: ...}. Example for RDS: {value: [{"Number of Nodes": {value: "1"}, '
    '"Instance Type": {value: "db.r6g.xlarge"}, "undefined": {value: {unit: "100", '
    'selectedId: "%Utilized/Month"}}, "Deployment Option": {value: "Single-AZ"}, '
    '"TermType": {value: "OnDemand"}}]}.'
)

# ─── In-memory caches ────────────────────────────────────────────────────────

_manifest_cache: dict = {}
_definition_cache: dict = {}
_metadata_cache: dict = {}


# ─── Helper functions ────────────────────────────────────────────────────────

def resolve_partition(region: Optional[str]) -> str:
    """Resolve the AWS partition for a given region."""
    if not region:
        return "aws"
    if region.startswith("us-iso-"):
        return "aws-iso"
    if region.startswith("us-isob-"):
        return "aws-iso-b"
    return "aws"


def _parse_double_encoded_response(raw_text: str) -> dict:
    """Parse the double-encoded JSON response from the save API."""
    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("AWS save API returned invalid JSON")

    body_str = result.get("body")
    if body_str is None:
        raise ValueError("AWS save API response missing 'body' field")

    try:
        body = json.loads(body_str)
    except (json.JSONDecodeError, TypeError):
        raise ValueError("AWS save API returned invalid body")

    if not body.get("savedKey"):
        raise ValueError(
            f"AWS save API did not return a savedKey: {json.dumps(body)[:200]}"
        )
    return body


# ─── Metadata fetching ───────────────────────────────────────────────────────

async def _fetch_mapping_metadata(mapping_def: Optional[dict]) -> Optional[dict]:
    """
    Fetch PLC_2.0 metadata.json for a mapping definition.
    Returns {valueAttributes, primarySelectors, secondarySelectors} or None.
    """
    if not mapping_def or mapping_def.get("mappingDefinitionVersion") != "PLC_2.0":
        return None

    url = mapping_def.get("mappingDefinitionURL")
    if not url or not url.endswith("metadata.json"):
        return None

    resolved = f"{METADATA_CDN}/{url.replace('[currency]', 'USD')}"

    if resolved in _metadata_cache:
        return _metadata_cache[resolved]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.get(resolved)
            if res.status_code != 200:
                _metadata_cache[resolved] = None
                return None
            data = res.json()
            result = {
                "valueAttributes": data.get("valueAttributes", {}),
                "primarySelectors": data.get("primarySelectors", []),
                "secondarySelectors": data.get("secondarySelectors", []),
            }
            _metadata_cache[resolved] = result
            return result
    except Exception:
        _metadata_cache[resolved] = None
        return None


# ─── Main functions ──────────────────────────────────────────────────────────

async def load_manifest(partition: str = "aws") -> dict:
    """
    Load and parse the AWS services manifest for a partition.
    Returns a dict mapping service key -> service info.
    """
    if partition not in PARTITIONS:
        valid = ", ".join(PARTITIONS.keys())
        raise ValueError(f"Unknown partition '{partition}'. Valid partitions: {valid}")

    if partition in _manifest_cache:
        return _manifest_cache[partition]

    url = f"{CDN_BASE}{PARTITIONS[partition]['manifestPath']}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(url)
        if res.status_code != 200:
            raise RuntimeError(f"Manifest fetch failed: HTTP {res.status_code}")
        manifest = res.json()

    services = {}
    for s in manifest.get("awsServices", []):
        key = s.get("key") or s.get("serviceCode")
        if key:
            services[key] = {**s, "key": key}

    print(f"Loaded {len(services)} services from manifest (partition: {partition})")
    _manifest_cache[partition] = services
    return services


def find_service(manifest: dict, name: str) -> Optional[dict]:
    """Find a service by exact key (case-insensitive)."""
    lower = name.lower()
    for key, svc in manifest.items():
        if key.lower() == lower:
            return svc
    return None


def search_services(manifest: dict, query: str) -> list | dict:
    """
    Search services by name/keyword. Supports comma-separated queries.
    Returns a list for single query or a dict of {term: matches} for multiple.
    """
    terms = [t.strip().lower() for t in query.split(",") if t.strip()]

    def _search(term: str) -> list:
        matches = []
        for key, svc in manifest.items():
            if svc.get("subType") == "subServiceSelector":
                continue
            if svc.get("isActive") == "false":
                continue

            hit = (
                term in key.lower()
                or (svc.get("name") and term in svc["name"].lower())
                or any(
                    term in kw.lower()
                    for kw in svc.get("searchKeywords", [])
                )
            )
            if hit:
                matches.append({"key": key, "name": svc.get("name")})
        return matches

    if len(terms) == 1:
        return _search(terms[0])

    results = {}
    for term in terms:
        results[term] = _search(term)
    return results


async def fetch_service_definition(
    manifest: dict, service_code: str, partition: str = "aws"
) -> Optional[dict]:
    """Fetch the full service definition JSON for a given service code."""
    cache_key = f"{partition}:{service_code}"
    if cache_key in _definition_cache:
        return _definition_cache[cache_key]

    svc = manifest.get(service_code)
    if not svc:
        return None

    url_path = svc.get("serviceDefinitionUrlPath") or f"/data/{service_code}/en_US.json"
    cdn_prefix = PARTITIONS.get(partition, {}).get("cdnPrefix", "")
    full_url = f"{CDN_BASE}{cdn_prefix}{url_path}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(full_url)
        if res.status_code != 200:
            raise RuntimeError(
                f"Definition fetch failed for {service_code}: HTTP {res.status_code}"
            )
        definition = res.json()

    _definition_cache[cache_key] = definition
    return definition


def extract_input_fields(definition: dict) -> list:
    """
    Recursively extract input fields from a service definition.
    Returns a list of field dicts with type, id, label, options, etc.
    """
    fields = []
    seen = set()

    def visit(obj, template_id=None):
        if not obj or not isinstance(obj, dict):
            return

        obj_id = obj.get("id")
        obj_type = obj.get("type")
        obj_subtype = obj.get("subType")

        if obj_id and (obj_type in INPUT_TYPES or obj_subtype in INPUT_SUBTYPES):
            field_type = obj_subtype or obj_type

            # Skip decorative types
            if field_type in ("bodyText", "headerText", "alert"):
                pass
            # Skip "without free tier" / MVP duplicate fields
            elif (
                "WithoutFreeTier" in obj_id
                or "_withoutFree" in obj_id
                or obj_id.endswith("_MVP")
            ):
                pass
            else:
                dedup_key = f"{obj_id}:{field_type}"
                if dedup_key not in seen:
                    seen.add(dedup_key)

                    field = {"id": obj_id, "type": field_type}
                    if template_id:
                        field["templateId"] = template_id
                    if obj.get("label"):
                        field["label"] = obj["label"]
                    if obj.get("options"):
                        field["options"] = [
                            {
                                **({"id": o["id"]} if o.get("id") is not None else {}),
                                **({"label": o["label"]} if o.get("label") else {}),
                            }
                            for o in obj["options"]
                            if o.get("id") is not None or o.get("label") is not None
                        ]
                    if obj.get("unit"):
                        field["unit"] = obj["unit"]

                    # fileSize fields
                    if field_type == "fileSize":
                        drop_down_size = obj.get("dropDownSize", [])
                        sizes = [s.get("value") or s.get("id") or "gb" for s in drop_down_size] or ["gb"]
                        default_option = obj.get("defaultOption", {})
                        default_size = default_option.get("size") or obj.get("outputSize") or "gb"
                        default_freq = default_option.get("frequency") or obj.get("outputFrequency") or "NA"
                        field["unitFormat"] = (
                            f"{{value}}|{{size}}|{{frequency}} — sizes: [{', '.join(sizes)}], "
                            f'default: "{default_size}|{default_freq}"'
                        )
                        field["validSizes"] = sizes
                        field["defaultUnit"] = f"{default_size}|{default_freq}"

                    # columnFormIPM composite
                    if field_type == "columnFormIPM":
                        field["mappingDefinitionName"] = obj.get("mappingDefinitionName")
                        field["row"] = []
                        for r in obj.get("row", []):
                            item = {
                                "label": r.get("label"),
                                "selectorId": r.get("selectorId"),
                                "type": r.get("type"),
                            }
                            if r.get("exportValueAs"):
                                item["exportValueAs"] = r["exportValueAs"]
                            if r.get("isInstanceType"):
                                item["isInstanceType"] = True
                            if r.get("mappingValue"):
                                item["mappingValue"] = r["mappingValue"]
                            field["row"].append(item)
                        field["valueShape"] = COLUMN_FORM_IPM_VALUE_SHAPE

                    fields.append(field)

        # Recurse into child values
        for v in obj.values():
            if isinstance(v, list):
                for item in v:
                    if isinstance(item, dict):
                        visit(item, template_id)
            elif isinstance(v, dict):
                visit(v, template_id)

    # Walk each template separately
    templates = definition.get("templates") if isinstance(definition.get("templates"), list) else None
    if templates and len(templates) > 0:
        for tpl in templates:
            visit(tpl, tpl.get("id"))
    else:
        visit(definition)

    return fields


async def enrich_fields_with_metadata(definition: dict, fields: list) -> list:
    """
    Enrich columnFormIPM fields with valid selector values from PLC_2.0 metadata.
    Fetches metadata for each unique mappingDefinitionName.
    """
    mapping_defs = definition.get("mappingDefinitions")
    if not isinstance(mapping_defs, list) or len(mapping_defs) == 0:
        return fields

    # Collect unique mappingDefinitionNames referenced by columnFormIPM fields
    needed = set()
    for f in fields:
        if f.get("type") == "columnFormIPM" and f.get("mappingDefinitionName"):
            needed.add(f["mappingDefinitionName"])

    if not needed:
        return fields

    # Fetch all needed metadata
    metadata_map = {}
    for name in needed:
        mapping_def = next(
            (d for d in mapping_defs if d.get("mappingDefinitionName") == name), None
        )
        meta = await _fetch_mapping_metadata(mapping_def)
        if meta:
            metadata_map[name] = meta

    # Attach selectorValues to each columnFormIPM field
    for f in fields:
        if f.get("type") == "columnFormIPM" and f.get("mappingDefinitionName"):
            meta = metadata_map.get(f["mappingDefinitionName"])
            if meta:
                row_selectors = {
                    r.get("selectorId") for r in f.get("row", []) if r.get("selectorId")
                }
                values = {}
                for key, vals in meta.get("valueAttributes", {}).items():
                    if key in row_selectors:
                        values[key] = vals
                if values:
                    f["selectorValues"] = values

    return fields


async def save_estimate(payload: dict) -> dict:
    """
    Save an estimate to the AWS calculator API.
    Returns {estimateId, shareableUrl}.
    """
    json_body = json.dumps(payload)
    groups_count = len(payload.get("groups", {}))
    services_count = len(payload.get("services", {}))
    print(
        f"[save] Sending {len(json_body)} bytes, "
        f"{groups_count} groups, {services_count} ungrouped services"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(
            SAVE_URL,
            content=json_body,
            headers={
                "content-type": "application/json",
                "Referer": "https://calculator.aws/",
            },
        )

    raw_text = res.text
    if res.status_code != 200:
        print(f"[save] HTTP {res.status_code}: {raw_text[:500]}")
        try:
            body = _parse_double_encoded_response(raw_text)
            detail = body.get("message") or raw_text[:200]
        except Exception:
            detail = raw_text[:200]
        raise RuntimeError(f"AWS save API returned HTTP {res.status_code}: {detail}")

    body = _parse_double_encoded_response(raw_text)
    print(f"[save] OK → {body['savedKey']}")
    return {
        "estimateId": body["savedKey"],
        "shareableUrl": f"https://calculator.aws/#/estimate?id={body['savedKey']}",
    }


async def fetch_estimate(estimate_id: str) -> dict:
    """Fetch a saved estimate by its ID."""
    url = f"{READ_URL}/{estimate_id}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.get(url)
        if res.status_code != 200:
            raise RuntimeError(f"Failed to fetch estimate: HTTP {res.status_code}")
        return res.json()


def estimate_to_markdown(data: dict) -> str:
    """Convert an estimate data dict to a human-readable markdown string."""
    lines = [f"# {data.get('name', 'AWS Estimate')}\n"]

    total = data.get("totalCost")
    if total:
        monthly = total.get("monthly")
        upfront = total.get("upfront")
        monthly_str = f"${monthly:.2f}" if monthly is not None else "$0.00"
        upfront_str = f" | **Upfront:** ${upfront:.2f}" if upfront else ""
        lines.append(f"**Total Monthly Cost:** {monthly_str}{upfront_str}\n")

    def render_services(services: dict, indent: str = ""):
        for svc in services.values():
            cost = ""
            svc_cost = svc.get("serviceCost", {})
            if svc_cost.get("monthly") is not None:
                cost = f" — ${svc_cost['monthly']:.2f}/mo"
            lines.append(
                f"{indent}- **{svc.get('serviceName', 'Unknown')}** "
                f"({svc.get('regionName', 'N/A')}){cost}"
            )
            if svc.get("description"):
                lines.append(f"{indent}  - Description: {svc['description']}")
            if svc.get("configSummary"):
                lines.append(f"{indent}  - Config: {svc['configSummary']}")

    services = data.get("services")
    if services and len(services) > 0:
        lines.append("## Services\n")
        render_services(services)

    groups = data.get("groups")
    if groups:
        for group in groups.values():
            lines.append(f"\n## {group.get('name', 'Group')}\n")
            group_cost = group.get("totalCost", {})
            if group_cost.get("monthly") is not None:
                lines.append(f"**Group Monthly:** ${group_cost['monthly']:.2f}\n")
            if group.get("services"):
                render_services(group["services"])

    return "\n".join(lines)
