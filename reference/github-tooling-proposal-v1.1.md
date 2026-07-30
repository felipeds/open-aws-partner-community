# Proposal: GitHub structure for backlog, working groups, and shared code

**Status:** Proposed — open for lazy consensus (§7.1)
**Proposer:** Felipe Souza (CI&T, convener)
**Chapter:** Brazil
**Date opened:** 2026-06-04
**Decision rule:** Lazy consensus. Approved if no objection is raised in the chapter's Slack within 5 business days. An objection moves the item to the next bi-weekly council call.

---

## Change log

| Rev | Date | Author | Summary |
|-----|------|--------|---------|
| v1.0 | 2026-06-04 | Felipe Souza (CI&T) | Initial proposal |
| v1.1 | 2026-06-05 | Fabiano Barros (BRQ) | §7.3: add GitHub Actions cross-company check to enforce two-key rule beyond CODEOWNERS; §10: set repos to private until public communication policy is decided |

---

## Why this proposal

Council already adopted GitHub as the home for the chapter's shared code (Decision History #2, 2026-05-29). This proposal does **not** re-decide that. It proposes *how* GitHub is structured so that the backlog and working-group rules in §7 are enforced by the tooling rather than by hand — and, in doing so, closes four of the open questions in §10.

It deliberately ships an **empty backlog**. Items are seeded by council members at the next session (Decision #7). Nothing here pre-selects a working group or pilot.

---

## What is being proposed

**1. One neutral GitHub Organization for the whole community.**
Chapters are not separate orgs — they are teams, labels, and project boards inside one org. This keeps the single shared codebase genuinely shared (§6) and lets any partner contribute cross-region by normal PR (§7.8), while each chapter keeps an independent council, backlog, and working groups (§7.6).
→ *Closes §10 "Repository home": neutral org from day one, over a founder's account, to avoid a later migration and to signal neutrality (§4.3, §11).*

**2. Three repositories at launch — not one per working group.**
- `.github` — shared issue forms, templates, contribution docs.
- `community` — single source of truth (community reference, governance, decision log) and the **backlog, kept as Issues**.
- `codebase` — the shared code (agents, connectors, validation tools, reference workflows, and implementation patterns, per §1). Each working group is a **folder** with its own CODEOWNERS, per §7.7. A working group graduates to its own repository only when its release cadence requires it.

**Repository visibility (v1.1 — Fabiano Barros, BRQ):** All three repositories launch as **private**, visible only to org members. They remain private until the council resolves the public communication policy (§10, currently open). This is the safe default: the decision log lives in `community`, and making it public before the policy is settled could pre-empt that decision. The council can flip visibility at any time with a single setting change; no content migration is required.

**3. Backlog tooling: GitHub Issues + Projects, with a reaction-based heat map.**
A backlog idea is a structured issue (problem, why it is non-differentiating, expected reusable output, which partners feel the pain). The heat map is issues sorted by 👍 reactions — a live view, no tool to build. A chapter Project board tracks each item through `Idea → Heat-mapping → WG forming → Active → At-risk → Archived`. The heat map ranks but never auto-promotes; an item becomes a working group only when two partners commit leads (§7.3, §7.12).
→ *Closes §10 "Backlog tooling."*

**4. Governance enforced by automation, not by memory.**
- **Two-key rule (§7.3):** CODEOWNERS per working-group folder → a two-person leads team, one per partner company; branch protection requires code-owner review. A GitHub Actions status check (required, no bypass) additionally verifies that the two approving accounts belong to *different* partner-team orgs and blocks merge if they do not — CODEOWNERS alone cannot enforce the cross-company constraint in native GitHub. *(Adjustment v1.1 — Fabiano Barros, BRQ)*
- **60-day heartbeat (§7.4):** a scheduled job flags inactive working groups at-risk, then archives them.
- **Lazy consensus (§7.1):** an RFC issue auto-approves after 5 business days unless an objection label is present.
- **License & contribution (§6):** MIT + DCO check on every PR.
- **Anti-goals (§5):** PR template attestation that no customer data or differentiated IP is included.

**5. Per-partner GitHub teams.**
Every contributor belongs to exactly one partner team. This makes the two-different-companies rule checkable and lets the community see contribution balance across partners — neutrality made visible (§4.3).

---

## How per-folder merge authority works (§7.3 two-key rule)

In the `codebase` monorepo, each working group owns only its own folder. This is enforced by a path-scoped `CODEOWNERS` file plus branch protection:

- Each WG folder maps to its own two-person leads team, e.g. `/pricing-calculator/ → @org/wg-pricing-leads`. A catch-all `*` maps anything outside a WG folder to the council.
- Branch protection on `main` requires a pull request, **requires review from code owners**, and allows **no bypass** (admins included).
- A PR into a folder cannot merge until that folder's leads approve. A lead of one WG is **not** a code owner of another WG's folder, so their approval does not count there — they cannot push code into a folder they don't own.
- A PR touching two folders requires approval from **both** WG leads teams.

The boundary is enforced on **approval authority**, which is per-folder, not on the merge button itself: once required reviews pass, any writer can click merge, but no folder's change can ever be *approved* without its own leads. WG leads are not repo admins; only a neutral maintainer/org owner holds admin, and branch protection has no bypass.

**Two-key strictness (council choice):** set required approvals to **2** on production folders, so every merge needs both leads — one per company — to sign off. This is the faithful reading of "no single partner is the sole merge authority." A WG that later needs a hard permission wall (not just a review wall) can graduate to its own repository, where write access is literally per-repo (§7.7).

**Cross-company enforcement (v1.1 — Fabiano Barros, BRQ):** Branch protection with required approvals does not, by itself, prevent a 1-lead + 1-random-contributor merge in native GitHub. To close this gap, a **required GitHub Actions status check** runs on every PR against a protected branch. The check reads the PR's current approvers, maps each to their partner team (via the per-partner GitHub team membership in item 5), and fails with a blocking status if fewer than two *distinct* partner organisations have approved. The merge button stays locked until the check passes. No bypass is permitted — not even for admins.

---

## One item left open for council (not decided here)

**Backlog voting model — per contributor vs. per partner (§10, §7.12).**
GitHub 👍 reactions are per contributor, so a larger partner carries more weight. A per-partner model (one company, one weight) is also supportable with a small counting step. The structure supports either by swapping one component. Recommend deciding this at the next call when the backlog is seeded.

---

## Decision requested

Approve items 1–5 by lazy consensus, including the v1.1 adjustments (cross-company Actions check on §7.3; private visibility until §10 is resolved). Carry the backlog voting model to the next council call.
