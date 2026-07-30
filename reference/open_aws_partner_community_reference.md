
# Open AWS Partner Community — Reference

> **Working title.** Final name to be chosen by the founding partners at the kickoff session. Placeholder used throughout this document.

-----

## How to use this document (instructions for LLMs and contributors)

This is the **single source of truth** for the community. It is designed to be read by both humans and LLMs as context for generating downstream artifacts (emails, decks, talking points, RFCs, proposals, social posts, etc.).

**Rules for any LLM working from this document:**

1. **Do not invent facts.** If a section is marked `[OPEN]`, `[TBD]`, or is empty, do not fabricate content for it. Ask the user, or explicitly flag the gap in your output.
2. **Distinguish decided vs. proposed.** Sections under `## Decisions` are committed. Sections under `## Open Questions` are not. Do not present open questions as settled facts in external-facing content.
3. **Preserve the voice.** See `## Voice & Positioning`. Generated content should sound partner-led, neutral, and technically credible, and should never elevate any single founding partner or individual contributor above the others in external materials.
4. **Respect the anti-goals.** See `## Anti-Goals`. Never generate content that contradicts them, even if asked indirectly.
5. **When updating this file**, add an entry to `## Changelog` with date and a one-line summary. Do not silently rewrite decisions — move superseded items to `## Decision History` with rationale.

-----

## 1. One-line description

A partner-led, open-source community where AWS partners collaboratively build and maintain the reusable operating layer around AWS Partner Central, AWS partner workflows, internal sales processes, and partner automation — including agents, connectors, validation tools, reference workflows, and implementation patterns for areas such as pricing calculators, opportunity registration, funding requests, SOW generation, and related administrative work.

The community is designed to help partners reduce duplicated engineering effort on non-differentiating operational tooling while keeping proprietary customer relationships, delivery methods, commercial terms, and differentiated IP fully separate.

## 2. Problem statement

With the launch of Agentic Partner Central, every AWS partner is independently investing engineering resources to build the same set of agents to automate AWS partner administrative work. This work is:

- **Universal and newly urgent** — with Agentic Partner Central, every partner has the same automation work in front of them at the same time.
- **Non-differentiating** — no partner wins deals because their OFE agent is better than another partner's.
- **Expensive in aggregate** — the global partner ecosystem is collectively spending tens of millions of dollars rebuilding the same plumbing.
- **A drag on the real work** — engineering hours spent on internal tooling are hours not spent on customer-facing innovation.

Partners compete on industry expertise, delivery quality, and customer relationships — not on the quality of their internal Partner Central automation. This makes the space a natural candidate for open-source collaboration, similar to how the Linux Foundation, CNCF, and OpenTelemetry consolidated shared infrastructure across competing companies.

## 3. Vision

A neutral, partner-governed open-source community that produces production-grade, reusable agents and tooling for AWS Partner Central operations. Any AWS partner — from global SI to specialist boutique — can adopt, contribute to, and extend the shared codebase, accelerating their internal automation roadmap while focusing their proprietary investment on actual differentiators.

## 4. Goals

1. **Reduce duplicate investment** across the AWS partner ecosystem on non-differentiating Partner Central automation.
2. **Accelerate every member partner's** internal agentic roadmap by sharing production-ready components.
3. **Establish a neutral collaboration model** that scales from 4 founding partners to dozens of contributors without becoming captured by any single company.
4. **Create a credible interface to AWS** so the community's collective feedback can shape Partner Central's API surface, agent ergonomics, and partner experience.
5. **Build a trusted practitioner network** where partner engineers and leaders can exchange best practices and challenges of working with AWS — in service of, and not in competition with, the building work.

## 5. Anti-goals

These are explicit out-of-scope items. Do not propose, generate, or imply any of these in external content.

- **Not a marketplace.** No commercial transactions between partners through this community.
- **Not a customer data exchange.** No customer information, opportunity data, or pipeline information is ever shared.
- **Not a competitor to AWS Partner Central.** This builds *on top of* Partner Central APIs and agents; it does not replicate or replace them.
- **Not AWS-owned or AWS-funded (initially).** AWS may bless, amplify, or later sponsor the community, but the community is partner-governed.
- **Not a place to share competitive IP.** Differentiated industry solutions, proprietary methodologies, and customer-facing IP stay with each partner.
- **Not a foundation.** No legal entity, no membership dues, no formal incorporation until scale demands it.
- **Not a talking shop.** The building work is the gravitational center. Connection formats (forums, calls, roundtables) exist to serve the build mission, not as ends in themselves. If a connection format does not visibly improve the shared code, sharpen the roadmap, or strengthen contributor trust, it should be discontinued.

## 6. Founding partners

**Chapter model.** The community is organized as regional chapters. Each chapter has autonomy over local prioritization, local working groups, local in-person moments, and its relationship with the regional AWS Partner Org. All chapters contribute to a single shared codebase under common license (MIT), contribution mechanism (DCO), and anti-goals.

**Minimum bar to stand up a chapter.** Three active partner companies plus a named convener.

### Brazil chapter (founding)

Four partners have verbally committed to co-founding the Brazil chapter:

- **CI&T** — Represented by Felipe Souza, who also serves as the initial convener of the chapter and of the community.
- **Accenture** — Represented by Guilherme Barreiro.
- **BRQ** — Represented by Fabiano Barros.
- **DAREDE** — Represented by Flavio Rescia Dias.

Each partner also names an alternate council representative (§7.2). Alternates are to be named by the second council meeting.

### US chapter (forming)

A US chapter is in early formation, with founders in conversation. CI&T is the first committed partner in the US chapter, with Felipe Souza serving as initial convener. The chapter will be considered formally stood up when it reaches the minimum bar (three active partner companies plus a named convener). Timing of the US chapter's founding session is not coupled to the Brazil chapter's.

Additional chapters (other regions) may form over time on the same minimum-bar terms. No specific future chapters are committed at this stage.

## 7. Governance and working model

**Minimal viable governance.** The community uses the simplest governance model that allows partners to build together safely. It fits on one page and can be evolved later when the community outgrows it.

### 7.1 Decision rule

**Lazy consensus.** Any partner can propose a decision in the chapter's shared channel. If no objection is raised within 5 business days, the proposal is approved. If an objection is raised, the item is discussed at the chapter's next bi-weekly council call and decided by majority vote of that chapter's council.

Council calls run on a bi-weekly cadence, 45 minutes by default. Cadence is reviewable as the chapter matures.

### 7.2 Three roles

| Role | Who | Power |
|------|-----|-------|
| Council Member | 1 primary per founding partner, per chapter, plus 1 named alternate | Votes on governance & scope changes within that chapter |
| WG Lead | Leads a working group (exactly 2 leads per WG, one per partner, from 2 different partners) | Joint final say on technical decisions and merge authority in their WG |
| Contributor | Anyone with a merged PR | Submit & review code |

Each founding partner names one primary council member and one alternate. The alternate has full voting rights when acting on behalf of the primary. Only one of the primary or the alternate attends a given council meeting on behalf of the partner, to keep council meetings appropriately sized.

### 7.3 Two-key rule

Every working group has **exactly two working group leads with merge rights, one from each of two different partner companies.** No more than two leads per working group. No single partner is the sole merge authority for any working group.

**How many approvals a pull request needs: one.** Having two leads from two different partner companies means every working-group folder always has **at least two eligible code-owner approvers**, so a merge is never blocked on one person's availability. It does *not* mean a PR needs two approvals — a single approving review from either lead is enough to merge. The "two keys" describe the two partners who *share* standing merge authority over the folder, not two sign-offs demanded per pull request. (This clarifies §7.3 against the stricter "required approvals = 2" option floated in the GitHub-tooling proposal, which is not adopted.)

A working group does not form until both leads are committed. If a working group falls below this requirement during its life (a lead steps away), it is flagged as at-risk and must restore a second lead from a different partner within 30 days, or be moved to archived status (see §7.4).

Open contribution is preserved: anyone may submit code through the open-source contribution flow. Other partners may join the working group as contributors, reviewers, testers, or adopters at any time. Only the two working group leads may merge.

### 7.4 60-day heartbeat

If a working group has zero activity (no commits, PRs, or issue discussion) for 60 days, it is moved to archived status. Any partner can revive an archived working group by volunteering to own it.

### 7.5 Conflict resolution

Disagree → WG leads decide. Still disagree → Council votes. Tie = no change (status quo preserved).

### 7.6 Chapter autonomy

**Each chapter operates its own council and is independent of other chapters.** A chapter's council is composed of one council member per founding partner *in that chapter*, and it decides governance, scope, and disputes within that chapter — its own working groups, its own lazy-consensus process, its own bi-weekly call. There is no community-wide council and no cross-chapter approval requirement.

Each regional chapter has freedom to decide which working groups to create, which problems to prioritize, and how to organize its local contributors.

A chapter may spin up a working group when exactly two partners each commit a named working group lead, satisfying §7.3. Additional partners may join later as contributors, reviewers, testers, or adopters, but not as additional leads.

### 7.7 Working groups

Each working group must define:

- Exactly two named leads, one per partner, from two different partner companies (§7.3).
- The problem being solved.
- The expected output.
- The initial scope and explicit non-scope.
- The repository or folder where the work will live.
- The contribution and review process for that work.

The working group leads are jointly responsible for keeping the work moving, reviewing contributions, maintaining scope discipline, and deciding whether submitted code is ready to merge.

### 7.8 Cross-region contribution

Chapters are encouraged to contribute to working groups started by other regions.

If a chapter or partner wants to help with a working group from another region, they contribute through the normal open-source process: issue, proposal, pull request, review, and merge.

The working group leads validate the contribution based on technical quality, scope fit, security, maintainability, and alignment with the community's anti-goals. No special regional approval is required.

### 7.9 Council meeting quorum

A chapter's council meeting is **official** — decisions can be ratified, votes can be taken, and lazy-consensus objections can be resolved — only when at least **75% of that chapter's council members are present** (rounded up to the nearest whole person).

For each partner, either the primary council member or their named alternate (§7.2) counts as that partner's seat; only one of the two attends on behalf of the partner.

For the Brazil chapter at founding (4 partners, 4 council seats), this means at least 3 of 4 seats must be filled.

If quorum is not met, the meeting still happens — discussion remains valuable — but no binding decisions are made. Pending votes carry over to the next council call.

Quorum is computed per chapter, since each chapter operates its own council (§7.6). This rule is intentionally simple and can be revisited under §7.11 when more chapters or more partners require it.

### 7.10 CODEOWNERS

Where practical, production modules should use CODEOWNERS or an equivalent review mechanism so that changes are reviewed by the appropriate working group leads or maintainers before merge.

### 7.11 Revisit governance later

The community should revisit governance only when scale requires it — for example, when multiple chapters are active, multiple working groups are shipping code, or external sponsorship is being considered.

### 7.12 Backlog and working group intake

Each chapter maintains a shared backlog of candidate working group ideas. The backlog is open to partner contributions: partners propose problems they would like the community to solve together.

Partners express demand by voting on backlog items. Aggregated votes produce a **heat map** of which problems are most widely felt across the chapter's partners.

**The heat map is a signal, not a mandate.** Any backlog item can be picked up by partners willing to form a working group around it under §7.3 and §7.6, regardless of where the item ranks. Conversely, a high-ranked item does not automatically become a working group — it becomes one only when two partners step up as leads.

Backlog tooling, the voting model (per-partner vs. per-contributor), and the scope of who may add items remain open and will be resolved by lazy consensus or at a future council call.

### 7.13 Meeting practices

Council meetings are recorded. Recordings are shared with chapter council members through the chapter's Slack workspace.

Council members may bring AI note-taking agents to council meetings. Recordings, transcripts, and AI-generated notes are for internal partner use only and must not be shared externally or publicly.

## 8. Community connection layer

The chapter's Slack workspace is the community connection layer — the standing space where partners share context, surface upcoming problems worth solving together, run lazy-consensus threads, distribute council recordings, and build the trust that makes cross-company collaboration on the codebase work.

## 9. AWS relationship model

The community is partner-led. AWS is an important stakeholder, platform owner, and potential amplifier, but not the initial owner or governor of the community.

The AWS relationship should evolve in stages.

### Stage 1 — Informal awareness

Founding partners may inform their AWS contacts that the community is being formed.

At this stage, there is no formal ask, no sponsorship request, and no expectation that AWS will approve or manage the community.

### Stage 2 — Technical feedback

Once a working group has real implementation experience, the community may share structured feedback with AWS.

### Stage 3 — Product and partner-org conversation

If a working group produces useful findings, the community may request a more formal conversation with relevant AWS Partner Central, Partner Org, or technical teams.

### Stage 4 — Amplification

If the community ships something useful and safe, AWS may choose to amplify it through partner channels, events, blogs, references, or informal introductions.

### Stage 5 — Sponsorship or formal involvement

Formal AWS sponsorship, funding, or governance participation should be considered only after the community has proven that partners can collaborate independently.

## 10. Open questions

These are unresolved and must not be presented as decided in external content.

- **Community name.** Final name to be selected by founding partners.
- **First working group.** Which backlog item becomes the chapter's first active working group, decided through the §7.12 intake process when two partners commit leads.
- **First working group leads.** The two partner leads who will own the first working group, defined once two partners commit to a backlog item.
- **Initial contributors.** Which partners will contribute code, examples, review, testing, documentation, or implementation feedback to the first working group.
- **Repository home.** Whether the chapter's GitHub organization is hosted under a neutral name from the start or temporarily under one founder's account.
- **Slack workspace structure.** Specific channel layout, including where lazy-consensus proposals are posted and where council recordings are stored.
- **Backlog tooling.** Which tool the chapter uses to maintain the backlog (§7.12).
- **Backlog voting model.** Whether votes are per partner, per contributor, or another model; and who is eligible to add backlog items.
- **Recurring meeting slot.** Specific day and time for the bi-weekly council cadence (§7.1).
- **AWS's formal role and timing.** When and how AWS is brought in beyond informal awareness, including which partner informs which AWS contact at Stage 1 (§9).
- **Community review cadence.** When and how often the council decides whether to continue, change, pause, or stop the community.
- **Chapter coordination.** How chapters stay aware of each other's working groups before the community is large enough to need formal governance.
- **Public communications policy.** Who can speak publicly on behalf of the community, and under what conditions.

## 11. Voice & Positioning

**For all external content generated about this community, use the following voice:**

- **Partner-led, not vendor-led.**
- **Pragmatic, not idealistic.**
- **Technically credible.**
- **Neutral across founding partners.**

## 12. Decision history

### 2026-05-29 — Brazil Chapter, First Council Meeting

**Attendees:** Felipe Souza (CI&T, convener), Fabiano Barros (BRQ), Flavio Rescia Dias (DAREDE).
**Absent:** Guilherme Barreiro (Accenture).
**Quorum:** 3 of 4 council members present (≥75% per §7.9). Binding decisions ratified.

Decisions ratified at this meeting:

1. **Communications platform.** Slack is adopted as the Brazil chapter's communications platform. (Resolves the prior "Communications platform" open question.)
2. **Code home.** GitHub is adopted as the home for the chapter's shared open-source code. The choice between a neutral GitHub organization and temporary hosting under a founder's account remains open in §10.
3. **Backlog and working group intake (new §7.12).** The chapter maintains an open backlog of candidate working group ideas. Partners contribute items and vote, producing a heat map of partner demand. The heat map is a signal, not a mandate; working groups form per §7.3 only when two partners step up as leads.
4. **Cross-partner two-key rule (amends §7.3).** Every working group has exactly two working group leads, one from each of two different partner companies. No more than two leads per working group. Open contribution is preserved; other partners may join as contributors but not as additional leads. Merge rights remain with the two working group leads only.
5. **Working group formation bar (amends §7.6).** A working group forms only when exactly two partners commit named leads, one per partner. The previous bar — one partner owning plus one other interested in contributing/reviewing/testing — is replaced by the exactly-two-leads-from-two-partners requirement.
6. **Council cadence (amends §7.1).** Council moves from monthly to bi-weekly, 45 minutes by default. Cadence is reviewable as the chapter matures.
7. **Next council session purpose.** The next bi-weekly council meeting is dedicated to seeding the initial backlog (§7.12). Each council member brings their proposed items.
8. **Alternate council representatives (amends §7.2, §7.9).** Each founding partner names one primary council member and one alternate. The alternate has full voting rights when acting for the primary. Only one of the two attends any given meeting on behalf of the partner. Alternates to be named by the next council meeting.
9. **Meeting practices (new §7.13).** Council meetings are recorded; recordings are shared in Slack with chapter council members. AI note-taking agents are permitted at council meetings for internal partner use only — recordings, transcripts, and AI notes must not be shared externally or publicly.

Items not resolved at this meeting (carried as open in §10 or to future calls):

- Specific recurring day and time for the bi-weekly council cadence.
- Backlog tooling selection.
- Backlog voting model and intake permissions (per-partner vs. per-contributor; who may add items).
- GitHub organization hosting model (neutral org vs. temporarily under a founder).
- Slack channel structure, including the lazy-consensus thread location and recording storage channel.
- AWS Stage 1 confirmation and the "who informs whom" assignments on the AWS side (§9).

### 2026-07-29 — Async vote (WhatsApp): open-source license change

**Mechanism:** Asynchronous partner vote conducted over WhatsApp.
**Result:** 3 votes in favor, 0 against.
**In favor:** Felipe Souza (CI&T), Fabiano Barros (BRQ), Guilherme Barreiro (Accenture).

**Decision.** The shared codebase license changes from **Apache 2.0 to MIT**. Applied to §6 (Founding partners — common license) and to the License & contribution automation described in the GitHub tooling proposal. The DCO contribution mechanism is unchanged.

**Follow-up.** No `LICENSE` file yet exists in a codebase repo; when the shared repo is stood up, add the full MIT license text with the appropriate copyright line at the root.

## 13. Changelog

- **2026-05-29 — v1.1.** First Brazil chapter council meeting decisions integrated. Updates: §6 notes alternate representatives to be named; §7.1 council cadence changed from monthly to bi-weekly with a 45-minute default; §7.2 alternate council members introduced and the role formerly named "WG Owner" renamed to "WG Lead" throughout §7 for consistency with council usage; §7.3 two-key rule changed to require exactly two leads, one from each of two different partner companies (no more than two leads per WG); §7.5, §7.7, §7.8, §7.10 updated to reflect the two WG leads; §7.6 working group formation bar updated to match §7.3; §7.9 quorum clarified to count either primary or alternate as the partner's seat; new §7.12 (Backlog and working group intake) and §7.13 (Meeting practices) added; open-questions section updated to remove the resolved communications-platform question and add new open items surfaced by the meeting (backlog tooling, voting model, Slack channel structure, recurring slot, AWS Stage 1 assignments). Decision history populated with the first set of ratified items.
- **2026-07-29 — v1.3.** Open-source license changed from Apache 2.0 to MIT per async WhatsApp vote (3 in favor: Felipe Souza, Fabiano Barros, Guilherme Barreiro). Updated §6 common-license reference; decision recorded in §12. DCO contribution mechanism unchanged.
- **2026-05-29 — v1.2.** Post-meeting cleanup. Removed the prior §8 ("Suggested first work group (pilot)") — Pricing Calculator Agent is no longer a preselected first pilot and now competes as one backlog item among others under §7.12. Removed the prior §11 ("Roadmap illustrative, to be refined") — the §7.12 backlog and intake mechanism replaces the illustrative roadmap. Simplified the community connection layer to identify it as the chapter's Slack workspace. Renumbered: prior §9 → §8 (Community connection layer), §10 → §9 (AWS relationship model), §12 → §10 (Open questions), §13 → §11 (Voice & Positioning), §14 → §12 (Decision history), §15 → §13 (Changelog). Open-questions list refreshed: "First pilot pick" replaced by "First working group"; "Pilot review timing" replaced by "Program review cadence." Cross-section references updated throughout.
