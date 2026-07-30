# Working group: AWS Calculator Agent

**Status:** Forming — designated as the community's first working group.
**Sponsoring chapter:** [Brazil](../../chapters/brazil/)

An agent that automates AWS cost/pricing estimation — turning a described workload
into a structured, reviewable cost estimate — as shared, non-differentiating tooling
any partner can reuse. Pricing/estimation plumbing is undifferentiated operational
work; how each partner advises a customer on top of it is not, and stays out of scope.

## Leads (required to become active)

A working group is active only once **two partners commit named leads, one per
company** (§7.6). Until then this group is *forming*.

| Role | Name | Partner company | GitHub handle |
|------|------|-----------------|---------------|
| Lead 1 | _TBD_ | CI&T | [@ciandt-palma](https://github.com/ciandt-palma) |
| Lead 2 | _TBD_ | _different partner_ | _TBD_ |

> Update [`CODEOWNERS`](CODEOWNERS) in this folder with the two leads' GitHub team
> once confirmed.

## Scope

**In scope (non-differentiating, shared):**
- Parse a described workload into AWS services and usage assumptions.
- Produce a structured, itemized cost estimate against AWS public pricing.
- Explain assumptions and surface the cheap/expensive drivers of the estimate.
- Reusable connectors to AWS Pricing / Cost data as shared components.

**Out of scope (anti-goals, §5):**
- Any customer names, opportunity, or pipeline data.
- Partner-specific pricing, discounts, commercial terms, or advisory methodology.
- Anything customer-facing or differentiated.

## How to contribute

Open a PR against this folder. All commits require a DCO sign-off (`git commit -s`);
merges require the two-key cross-company approval (§7.3). See
[CONTRIBUTING.md](../../CONTRIBUTING.md).

See [`docs/charter.md`](docs/charter.md) for the working-group charter.
