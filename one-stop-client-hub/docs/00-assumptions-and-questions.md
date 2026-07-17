# Assumptions & clarifying questions

## Please answer (refines Phase 1)

1. **Volume:** Active census? Years of history to migrate? Avg documents per client?
2. **Export:** CSV/Excel modules available in myadultdaycare.com? API/SFTP? Document bulk download?
3. **Users:** Headcount by role (Admin, Nursing, Drivers, Billing, Activities, Leadership)? Family/case-manager access needed?
4. **Licensing:** M365 SKU? Power BI Pro/Premium? Power Apps / Dataverse licenses today?
5. **Lists vs Dataverse:** Stay Lists-first (this pack’s default) or Dataverse now?
6. **Centers:** Denver, Houston, or both as day-one sites?
7. **Billing cutover:** Keep claims in myadultdaycare.com initially, or move billing into Hub?
8. **Cutover style:** Parallel run length preference?
9. **Tenant:** Domain name? Purview labels already live? Existing SharePoint hub?

## Defaults baked into this pack

| Topic | Default |
|-------|---------|
| Platform | SharePoint Lists + Libraries (Phase 1) |
| Dataverse | Documented upgrade path only |
| Sites | Multi-center (DEN + HOU) |
| History | Design supports 2–3 years attendance/billing |
| Sync | One-time CSV + optional nightly delta |
| PHI email | Links only — never full identifiers in mail/Teams |
| Sample data | Synthetic DEMO IDs only |

Update this file when decisions are made so Andy / Zen-S / IT stay aligned.
