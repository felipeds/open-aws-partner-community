# Working groups

Each working group owns a single folder here. Working groups are the gravitational
center of the community — the building work (reference §7.7).

## Rules (reference §7.3, §7.6, §7.7)

- A working group forms **only** when two partners commit named leads, one per company.
- Each group has **exactly two leads**, from **two different** partner companies. They
  hold merge authority for the folder via `CODEOWNERS`; a required check enforces that
  the two approvals come from different partner companies.
- Open contribution is preserved — any partner may contribute by PR; only the two leads
  approve and merge.
- A group graduates to its own repository only when its release cadence requires it.
- A 60-day inactivity heartbeat flags a group at-risk, then archives it (§7.4).

## Folder layout for a working group

```
working-groups/<name>/
├── README.md      # what it does, status, leads
├── CODEOWNERS     # the two leads
├── docs/charter.md
├── src/
└── tests/
```

## Active / forming

| Working group | Status | Leads |
|---------------|--------|-------|
| [aws-calculator-agent](aws-calculator-agent/) | Forming | two partner leads TBD |
