# HIPAA-oriented M365 checklist — Sunrise / Autumn Day Care

Print or track in Planner. See also `docs/06-security-compliance.md`.

## Contract & governance

- [ ] Microsoft BAA signed
- [ ] Vendor BAA for myadultdaycare.com
- [ ] Privacy / Security officers named
- [ ] Retention schedule confirmed (CO/TX ADC + Medicaid)

## Identity

- [ ] MFA all users
- [ ] Conditional Access baseline
- [ ] No shared PHI logins
- [ ] SG-ClientHub-* groups created and reviewed
- [ ] Guests blocked on Client Hub

## SharePoint / Lists

- [ ] External sharing off for Hub
- [ ] Staging library unique permissions
- [ ] Versioning on ClientDocuments
- [ ] Medicaid view restricted to Billing/Nursing
- [ ] Default list forms hide high-risk fields from Front Desk

## Purview

- [ ] Label: Confidential – PHI
- [ ] Auto-label ClientDocuments
- [ ] DLP for Medicaid/SSN to external
- [ ] Audit enabled + retention

## Automation & BI

- [ ] Automation account least privilege
- [ ] Flows never email raw PHI
- [ ] Power BI sensitivity label + RLS
- [ ] KPI email aggregates only

## Migration

- [ ] Raw exports in Staging only
- [ ] Checksums logged
- [ ] Local working copies wiped
- [ ] No PHI committed to git

## Go-live

- [ ] Role-based access test passed
- [ ] Pilot reconcile signed
- [ ] Cutover approval (Joe)
