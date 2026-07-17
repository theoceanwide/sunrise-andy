# 7. SharePoint folder & site structure

**Site URL (example):** `https://<tenant>.sharepoint.com/sites/OneStopClientHub`  
**Site title:** One Stop Client Hub  
**Template:** Team site (no Group email flood) or Team site with Microsoft 365 Group locked down.

---

## Top-level information architecture

```
/sites/OneStopClientHub
├── Site Pages/
│   ├── Home.aspx                 # Hub landing: search, KPI links, quick actions
│   ├── How-To-Attendance.aspx
│   └── Compliance-Index.aspx
├── Lists/                        # See data model
│   ├── Centers
│   ├── Clients
│   ├── EmergencyContacts
│   ├── Attendance
│   ├── Assessments
│   ├── CarePlans
│   ├── CarePlanGoals
│   ├── BillingRecords
│   ├── Payers
│   ├── ClientNotes
│   ├── Incidents
│   ├── Medications
│   ├── TransportTrips
│   ├── Staff
│   └── ImportLog
├── Document libraries
│   ├── ClientDocuments           # PHI — labelled
│   ├── 01-Staging                # Imports only — Admin/Automation
│   ├── 02-Compliance             # Org-level licensing / CDPHE / HHSC
│   ├── 03-SOPs                   # Operations SOPs (non-client)
│   ├── 04-Forms-Templates        # Blank templates
│   └── 05-PowerBI-Exports        # Optional scheduled exports (aggregates)
└── Site Assets/
```

---

## `ClientDocuments` structure

**Pattern A (recommended): Center → Client**

```
ClientDocuments/
├── DEN/
│   ├── C-10021 - Doe, Jane/
│   │   ├── 01-Intake/
│   │   ├── 02-Assessments/
│   │   ├── 03-CarePlans/
│   │   ├── 04-Consents/
│   │   ├── 05-Medical/
│   │   ├── 06-Billing/
│   │   ├── 07-Incidents/
│   │   └── 08-Correspondence/
│   └── C-10022 - Smith, John/
│       └── ...
└── HOU/
    └── ...
```

**Naming:** `{ClientNumber} - {LastName}, {FirstName}`  
**Content types (optional):** Intake Packet, Assessment, Care Plan, Consent, Medical Order, Incident Packet, Billing Support.

**Settings:**

- Versioning: major versions (approve major for CarePlans if using approval)
- Sensitivity: default **Confidential – PHI**
- Sharing: disabled at library level if possible
- Search: allow, relies on ACL

---

## `01-Staging` structure

```
01-Staging/
├── Imports/
│   ├── raw/YYYY-MM-DD/           # Immutable vendor exports + checksums.txt
│   ├── working/                  # Transform scratch (short retention)
│   ├── ready/                    # Drop zone for Power Automate
│   ├── processed/YYYY-MM-DD/
│   └── failed/YYYY-MM-DD/
├── Manual-Uploads/
└── _Archive/
```

**Permissions:** SG-ClientHub-Admins + Automation SA only. Retention: delete `working/` after 30 days; keep `raw/` per retention policy.

---

## `02-Compliance` (org-level — from intern roadmap)

```
02-Compliance/
├── CDPHE/
├── HHSC/
├── Licensing/
├── Incident-Reports-Registry/    # Index only; client packets stay under ClientDocuments
├── Medicaid-Audits/
├── Policies/
└── Training-Evidence/
```

---

## `03-SOPs`

```
03-SOPs/
├── Transport/
│   ├── Seizure-Protocol-Vehicle.docx
│   └── Driver-Checklist.docx
├── Clinical/
│   ├── Fall-Response.docx
│   ├── Medication-Administration.docx
│   └── Elopement.docx
├── Intake/
│   └── Client-Intake-Onboarding.docx
├── Program/
│   └── Daily-Schedule-Club-Hour.docx
├── Kitchen/
│   └── HACCP-Daily-Log.docx
└── Billing/
    └── Billing-Cycle.docx
```

---

## Hub home page widgets (suggested)

1. Search box (site scope)
2. Quick links: New Attendance, New Incident, Client directory view
3. Power BI embedded tile (Executive Ops — aggregate)
4. Documents: “Templates” + “SOPs”
5. Approvals web part
6. News for policy changes (no PHI)

---

## Teams channel alignment

| Teams channel | Primary SharePoint surface |
|---------------|----------------------------|
| Ops | Hub home + Incidents |
| Nursing | Assessments, CarePlans, ClientDocuments |
| Transport | TransportTrips + driver app |
| Kitchen | Kitchen SOPs + inventory (future) |
| Activities | Program SOPs |
| Admin | Staging (admins), Compliance, Billing |

---

## Provisioning

Automated folder creation for each new client is handled by **PA-01**.  
Bulk create centers/root folders: [`../sharepoint/site-scripts/Create-ClientHub.ps1`](../sharepoint/site-scripts/Create-ClientHub.ps1).
