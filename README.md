# Open AWS Partner Community

A partner-governed, open-source community where AWS partners build shared,
**non-differentiating** operational tooling together — reducing duplicated
engineering effort while keeping customer relationships, delivery methods,
commercial terms, and differentiated IP fully separate.

> **Single source of truth:** [`reference/open_aws_partner_community_reference.md`](reference/open_aws_partner_community_reference.md).
> This README is a map; the reference doc governs.

---

## How this repository is organized

| Path | What lives here |
|------|-----------------|
| [`reference/`](reference/) | The community reference (governance, vision, anti-goals) and the GitHub-structure proposal. The reference doc is the single source of truth. |
| [`governance/`](governance/) | The decision log and other governance records maintained over time. |
| [`chapters/`](chapters/) | One folder per regional chapter. Each chapter runs an independent council, backlog, and set of working groups. |
| [`working-groups/`](working-groups/) | One folder per active working group. Each owns its folder via `CODEOWNERS` and is led by two people from **two different** partner companies. |
| [`.github/`](.github/) | Issue forms (backlog, working-group proposal, RFC), the PR template, and automation that enforces governance. |

## How the community runs (the short version)

- **Chapters, not silos.** The community is one shared codebase organized as regional
  chapters (Brazil is founding; US is forming). Chapters have local autonomy but
  contribute to the same repo under a common license, contribution mechanism, and anti-goals.
- **Backlog as Issues.** Candidate work is filed as [backlog issues](.github/ISSUE_TEMPLATE/backlog-item.yml)
  and heat-mapped by 👍 reactions. The heat map ranks; it never auto-promotes.
- **Working groups form on commitment, not on votes.** An item becomes a working group
  only when **two partners commit named leads, one per company** (§7.6). See
  [`working-groups/`](working-groups/).
- **Shared merge authority (§7.3).** Every working-group folder is owned by two leads
  from two different partner companies via `CODEOWNERS`, so there are always at least
  two eligible approvers — but only **one** code-owner approval is required to merge.
  The two leads provide redundancy, not a two-sign-off requirement.
- **Lazy consensus.** RFCs auto-approve after 5 business days unless an objection is raised (§7.1).
- **License & contribution.** [MIT](LICENSE) + [DCO](CONTRIBUTING.md) sign-off on every commit.

## Anti-goals (what this is **not**)

No marketplace. No customer-data exchange. No sharing of differentiated or customer-facing
IP. Not AWS-owned. Not a foundation. See §5 of the reference doc for the full list — every
PR attests to these.

## Getting started

- **Propose work:** open a [backlog item](.github/ISSUE_TEMPLATE/backlog-item.yml).
- **Start a working group:** open a [working-group proposal](.github/ISSUE_TEMPLATE/working-group-proposal.yml)
  once you have two committing partners.
- **Contribute code:** read [CONTRIBUTING.md](CONTRIBUTING.md) — all commits require a DCO `Signed-off-by`.

## Current working groups

| Working group | Status | Leads |
|---------------|--------|-------|
| [AWS Calculator Agent](working-groups/aws-calculator-agent/) | Forming | _two partner leads TBD_ |

## License

[MIT](LICENSE). Changed from Apache 2.0 by partner vote on 2026-07-29.
