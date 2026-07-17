# One Stop Client Hub — Sunrise Senior Daycare / Autumn Day Care LLC

Migration + operations platform for client management inside **Microsoft 365**: SharePoint (documents + lists), Power Automate, Power BI, and optional Dataverse upgrade path.

**Replaces / coexists with:** [myadultdaycare.com](https://myadultdaycare.com) (source system for clients, assessments, attendance, billing, care plans, Medicaid data).

---

## Clarifying questions (please answer when you can)

These do not block the starter pack below; defaults are already applied. Your answers refine Phase 1 scope and licensing.

1. **Volume:** Rough active client census? Historical years to migrate (1 / 3 / all)? Approx. documents per client?
2. **myadultdaycare.com export:** Can you export CSV/Excel for clients, attendance, billing, assessments, notes, documents? Any API/SFTP, or UI-only export?
3. **Users & roles:** How many staff? Roles needed (Admin, Nursing, Drivers, Billing, Activities, Read-only leadership)? External access (families, case managers)?
4. **Licensing:** Microsoft 365 Business Premium / E3 / E5? Power BI Pro vs Premium? Power Apps / Dataverse already licensed?
5. **Lists vs Dataverse preference:** Stay Lists-first (lower cost) or go Dataverse now (stronger relational + security roles)?
6. **Centers:** Denver only, Houston only, or both? Separate sites per location?
7. **Billing:** Medicaid claim submission stay in myadultdaycare.com, or fully move billing into Hub?
8. **Cutover:** Parallel run (both systems) vs hard cutover date?
9. **Existing M365:** Tenant domain? Sensitivity labels / Purview already configured? Existing SharePoint hub?

---

## Assumptions used in this pack (until you override)

| Area | Default assumption |
|------|-------------------|
| Census | ~50–150 active clients; migrate 2–3 years history |
| Locations | Multi-site ready (Denver + Houston) |
| Platform Phase 1 | **SharePoint Lists + Document Libraries** (no Dataverse required) |
| Platform Phase 2 | Optional **Dataverse** for Clients / Attendance / Billing if volume or security roles demand it |
| Documents | SharePoint libraries with sensitivity labels + unique per-client folders |
| Sync | One-time CSV import + optional nightly delta via Power Automate |
| HIPAA | M365 Business Premium or E3/E5 + BAA with Microsoft; Purview labels + audit |
| Mobile | Power Apps (or SharePoint mobile + Teams) for drivers/staff attendance |

---

## Deliverables index

| # | Deliverable | Path |
|---|-------------|------|
| 1 | Architecture (Mermaid + narrative) | [`docs/01-architecture.md`](docs/01-architecture.md) |
| 2 | Data model (lists/tables, columns, relationships) | [`docs/02-data-model.md`](docs/02-data-model.md) |
| 3 | Migration plan | [`docs/03-migration-plan.md`](docs/03-migration-plan.md) |
| 4 | Power Automate flows | [`docs/04-power-automate-flows.md`](docs/04-power-automate-flows.md) |
| 5 | Power BI report structure | [`docs/05-power-bi-reports.md`](docs/05-power-bi-reports.md) |
| 6 | Security & compliance checklist | [`docs/06-security-compliance.md`](docs/06-security-compliance.md) |
| 7 | SharePoint folder structure | [`docs/07-sharepoint-folders.md`](docs/07-sharepoint-folders.md) |

**Starter templates**

- List column schemas: `schemas/`
- PnP site script: `sharepoint/site-scripts/`
- Field maps + sample CSVs: `migration/`
- Flow definition stubs: `power-automate/`
- DAX measures: `power-bi/dax/`
- Security checklist (printable): `security/`

---

## Recommended Phase 1 stack

```
myadultdaycare.com (export)
        │
        ▼
CSV staging (secure SharePoint library)
        │
        ▼
Power Automate import / PnP PowerShell
        │
        ├─► SharePoint Lists (structured PHI)
        ├─► Client Documents library (files + labels)
        └─► Power BI semantic model → dashboards
                │
                └─► Teams “Client Hub” + Power Apps (mobile)
```

---

## Quick start (IT / Andy)

1. Confirm Microsoft **BAA** and enable Purview audit + sensitivity labels (see security doc).
2. Create site `OneStopClientHub` from [`sharepoint/site-scripts/Create-ClientHub.ps1`](sharepoint/site-scripts/Create-ClientHub.ps1).
3. Apply folder structure from [`docs/07-sharepoint-folders.md`](docs/07-sharepoint-folders.md).
4. Export sample CSVs from myadultdaycare.com; map columns using [`migration/field-maps/`](migration/field-maps/).
5. Dry-run import on 5–10 clients; validate against source.
6. Wire Power Automate flows (new client folder + records).
7. Publish Power BI v1 (census / attendance / billing / compliance).

---

## Related Sunrise work

- Intern roadmap: `/andy_intern_roadmap.html`
- Driver check-in app (separate branch): vehicle inspection + clock-in
- Existing check-in: `checkin.sunriseseniordaycare.com` — integrate attendance into Hub lists over time
