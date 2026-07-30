# Contributing

Thanks for helping build shared, non-differentiating tooling for AWS partners.
This guide is the operational summary; the
[community reference](reference/open_aws_partner_community_reference.md) governs
in case of any conflict.

## Before you contribute: the anti-goals

This community exists **only** for non-differentiating operational tooling. Do not
contribute, and do not include in any issue, PR, or file:

- Customer information, opportunity data, or pipeline information.
- Differentiated industry solutions, proprietary methodologies, or customer-facing IP.
- Anything that would turn this into a marketplace or a competitive-IP exchange.

Every pull request attests to this in the PR template.

## License and the DCO

- All contributions are licensed under the [MIT License](LICENSE).
- Every commit must be signed off under the
  [Developer Certificate of Origin](https://developercertificate.org/). Sign off by
  committing with `-s`:

  ```bash
  git commit -s -m "Your message"
  ```

  This appends a `Signed-off-by: Your Name <your@email>` trailer. A required check
  rejects any PR whose commits are not signed off.

## How work gets in

1. **Backlog first.** Open a [backlog item](.github/ISSUE_TEMPLATE/backlog-item.yml)
   describing the shared pain and the expected reusable output. The community
   heat-maps backlog items by 👍 reactions.
2. **Working group forms.** When two partners commit named leads (one per company),
   open a [working-group proposal](.github/ISSUE_TEMPLATE/working-group-proposal.yml).
   The working group gets a folder under [`working-groups/`](working-groups/) with its
   own `CODEOWNERS`.
3. **Code by PR.** Work in the working group's folder. Merges require review from a
   code owner, and a required check verifies the two approvals come from two
   **different** partner companies (the two-key rule, §7.3).
4. **Governance changes by RFC.** Non-code decisions go through an
   [RFC](.github/ISSUE_TEMPLATE/rfc.yml) under lazy consensus: approved automatically
   after 5 business days unless an objection is raised (§7.1).

## Partner teams

Every contributor belongs to exactly **one** partner GitHub team. This makes the
two-different-companies rule checkable and makes contribution balance visible.
