# 6. Security & compliance checklist (HIPAA-oriented)

This is an operational checklist for Sunrise / Autumn Day Care — not legal advice. Confirm with counsel and your compliance officer for CO/TX ADC + Medicaid requirements.

---

## A. Contractual & tenant baselines

- [ ] Microsoft **BAA** executed for the tenant
- [ ] Confirm licensed SKUs cover audit, DLP, sensitivity labels (Business Premium / E3 / E5 or add-ons)
- [ ] myadultdaycare.com vendor BAA still active during parallel run
- [ ] Written **HIPAA policies**: access, breach, retention, device, minimum necessary
- [ ] Designate Privacy Officer / Security Officer contacts

---

## B. Identity & access (Entra ID)

- [ ] MFA enforced for all users (especially admins)
- [ ] Conditional Access: block legacy auth; require compliant/hybrid device for PHI access if possible
- [ ] Privileged roles: PIM or just-in-time; no standing Global Admin for daily work
- [ ] Security groups mapped to Hub roles (see below)
- [ ] Guest access **disabled** on Client Hub site (or highly restricted)
- [ ] Shared mailboxes / generic logins not used for PHI
- [ ] Joiner-mover-leaver process: same-day removal on termination

### RBAC matrix (SharePoint)

| Group | Clients | Attendance | Assessments | CarePlans | Billing | Notes | ClientDocuments | Staging |
|-------|---------|------------|-------------|-----------|---------|-------|-----------------|---------|
| Admins | Full | Full | Full | Full | Full | Full | Full | Full |
| Nursing | Edit | Edit | Edit | Edit | Read | Edit | Edit | None |
| FrontDesk | Edit* | Edit | Read | Read | None | Edit (ops) | Contribute intake | None |
| Drivers | Read limited view | Edit own/today | None | None | None | None | None | None |
| Billing | Read + Medicaid view | Read | Read | Read | Edit | Read billing notes | Billing folder | None |
| Leadership-RO | Read | Read | Read | Read | Read aggregates | Read | Read | None |
| Automation SA | Contribute | Contribute | Contribute | Contribute | Contribute | Contribute | Contribute | Contribute |

\*Front desk: no MedicaidID column in default view.

- [ ] Break inheritance on Staging library
- [ ] Unique permission or separate library for “Medicaid / ID scans” if needed
- [ ] Default sharing links: **Specific people** only; expire links; block anonymous

---

## C. Data protection (Purview)

- [ ] Sensitivity label **Confidential – PHI** published
- [ ] Auto-label policy on ClientDocuments + Clients list exports
- [ ] DLP policy: block Medicaid ID / SSN patterns to external domains
- [ ] Encryption at rest (service-managed) verified; labels with encryption for high-risk docs if licensed
- [ ] External sharing on Hub site: **Off** or Existing guests only
- [ ] Device download restrictions for unmanaged devices (if App Protection / CA available)

---

## D. Audit, logging, monitoring

- [ ] Purview Audit enabled; retention ≥ 1 year (prefer 7 years if policy requires)
- [ ] SharePoint site audit / versioning **On** for libraries (major/minor as appropriate)
- [ ] Power Automate run history retained; alert on failed PA-01/PA-07
- [ ] Power BI activity log reviewed monthly
- [ ] Access review quarterly for SG-ClientHub-* groups
- [ ] ImportLog reviewed after every migration job

---

## E. Minimum necessary & UX controls

- [ ] List views omit MedicaidID/DOB except Billing/Nursing
- [ ] Power BI datasets exclude high-risk columns from general reports
- [ ] Teams posts contain links, not PHI payloads
- [ ] Mobile apps use Entra login; PIN/biometric via Intune if deployed
- [ ] Search: result sources limited; crawled PHI only within Hub ACLs

---

## F. SharePoint configuration

- [ ] Version history enabled (e.g. 50+ major versions on clinical docs)
- [ ] Content approval / checkout for CarePlans library (optional)
- [ ] Recycle bin process documented
- [ ] Retention labels: Client record retention per state Medicaid/ADC rules
- [ ] Site collection admin limited to 2–3 people
- [ ] Custom script / unmanaged devices policies per tenant baseline

---

## G. Migration-specific

- [ ] Raw exports stored only in Staging with Admin ACL
- [ ] Checksums recorded; chain of custody log
- [ ] Laptops used for export are encrypted + MFA
- [ ] Working files wiped from local disks after load
- [ ] No PHI in GitHub repos (this starter pack uses synthetic samples only)

---

## H. Incident / breach readiness

- [ ] Incident response runbook includes M365 audit search steps
- [ ] PA-07 notifies on clinical incidents; separate process for **privacy** incidents
- [ ] Breach notification timelines documented (HIPAA + state)
- [ ] Tabletop exercise annually

---

## I. Vendor & integration

- [ ] Graph / Power Automate connections reviewed annually
- [ ] No third-party Zapier-like tools on PHI without BAA
- [ ] checkin.sunriseseniordaycare.com: confirm hosting BAA + TLS + auth before syncing into Hub

---

## J. Go-live security sign-off

| Check | Owner | Date | Sign-off |
|-------|-------|------|----------|
| BAA + labels live | IT / Joe | | |
| RBAC tested per role | Andy + Grace | | |
| External sharing off | IT | | |
| Audit search verified | IT | | |
| Pilot PHI reconciled | Nursing + Billing | | |
| Cutover approved | Joe | | |

Printable copy: [`../security/HIPAA-M365-Checklist.md`](../security/HIPAA-M365-Checklist.md).
