# Charter — AWS Calculator Agent

## Problem

Every AWS partner independently builds throwaway tooling to translate a described
workload into an AWS cost estimate. This is repetitive, non-differentiating
engineering — a good fit for shared community tooling.

## Goal

A reusable agent (plus supporting connectors) that takes a described workload and
produces a structured, itemized, explainable AWS cost estimate against public pricing.

## Deliverables

1. Workload-description schema and parser.
2. Estimation engine over AWS public pricing data.
3. A reusable AWS Pricing / Cost data connector.
4. Explanation layer (assumptions + cost drivers).
5. Test suite with representative workload fixtures.

## Explicit non-goals (community anti-goals, §5)

- No customer, opportunity, or pipeline data — ever.
- No partner-specific discounts, commercial terms, or advisory methodology.
- Nothing customer-facing or differentiated.

## Success criteria

- Two partner companies actively co-lead and contribute.
- At least one other partner reuses the output in their own workflow.
- Estimates are reproducible and explainable from public inputs alone.

## Formation checklist (§7.6)

- [ ] Lead 1 committed (partner company + GitHub handle)
- [ ] Lead 2 committed (different partner company + GitHub handle)
- [ ] `CODEOWNERS` updated with the two leads' team
- [ ] Originating backlog item linked
