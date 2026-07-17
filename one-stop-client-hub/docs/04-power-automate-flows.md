# 4. Power Automate flows

Package flows in solution **`SunriseClientHub`**. Use environment variables for site URL and list IDs.

---

## Flow catalog

| ID | Flow name | Trigger | Priority |
|----|-----------|---------|----------|
| PA-01 | New Client Onboarding | When item created — Clients | P0 |
| PA-02 | CSV Import — Clients | When file created — Staging | P0 |
| PA-03 | CSV Import — Attendance | When file created — Staging | P0 |
| PA-04 | Attendance Missing Alert | Scheduled daily 10:00 local | P1 |
| PA-05 | Assessment Due Reminder | Scheduled weekly | P1 |
| PA-06 | Care Plan Approval | When status = PendingApproval | P1 |
| PA-07 | Incident High Severity Notify | When Incident created/modified | P0 |
| PA-08 | Daily KPI Email | Scheduled 07:00 | P1 |
| PA-09 | Document Label Enforce | When file created in ClientDocuments | P1 |
| PA-10 | Delta Sync Watermark | Scheduled nightly | P2 |
| PA-11 | Client Discharge Archive | When Status → Discharged | P2 |
| PA-12 | Billing Ready for Submit Digest | Scheduled weekly | P2 |

Detailed stubs: [`../power-automate/flows/`](../power-automate/flows/).

---

## PA-01 — New Client Onboarding

**Trigger:** SharePoint — When an item is created (`Clients`)

**Steps:**

1. Initialize variables: `ClientNumber`, `CenterCode`, `FolderPath`.
2. **Condition:** ClientNumber not empty; else post Adaptive Card to Admins and terminate.
3. **Create folder** in `ClientDocuments`:
   ```
   /{CenterCode}/{ClientNumber} - {LastName}, {FirstName}/
     01-Intake/
     02-Assessments/
     03-CarePlans/
     04-Consents/
     05-Medical/
     06-Billing/
     07-Incidents/
     08-Correspondence/
   ```
4. Update Client item: `DocumentFolderUrl`.
5. Create default **EmergencyContacts** placeholder row (optional).
6. Create starter **CarePlans** draft (Status = Draft) if enrollment type = New.
7. Post Teams message to **Nursing** + **Front Desk** (name + center only — no Medicaid ID in chat).
8. Start approval if intake packet incomplete (optional checklist list).

**Failure handling:** Scope + Configure run after; log to ImportLog / Ops list; email Admins.

---

## PA-02 / PA-03 — CSV Import

**Trigger:** When a file is created in `01-Staging/Imports/ready/`

**Filter:** Filename prefix `clients_` or `attendance_`.

**Pattern:**

1. Get file content → Compose → Parse CSV (Office Scripts, or Power Automate “Create CSV table” inverse via **SharePoint + script**, or use **PowerShell Azure Function**; starter uses **Excel Online table** pattern or JSON conversion).
2. For each row:
   - Upsert by `SourceSystemId` or `ClientNumber` (Get items with Filter Query → Update or Create).
3. Write ImportLog summary.
4. Move file to `01-Staging/Imports/processed/YYYY-MM-DD/`.
5. On errors: copy row to `failed/` CSV and continue.

**Guardrails:**

- Max concurrency 1–5 to avoid throttling.
- Batch attendance by month files.
- Never overwrite DOB/MedicaidID with blank cells (null-safe update).

See stub: [`../power-automate/flows/PA-02-csv-import-clients.json`](../power-automate/flows/PA-02-csv-import-clients.json).

---

## PA-04 — Attendance Missing Alert

**Trigger:** Recurrence 10:00 America/Denver (and/or Chicago for Houston).

**Logic:**

1. Get Active clients authorized for today (AuthorizedDays contains weekday).
2. Get Attendance for today.
3. Filter clients without Present/Partial/Excused.
4. Post Adaptive Card to Front Desk + Nursing with client display names only.
5. Optional: create tasks in Planner.

---

## PA-06 — Care Plan Approval

**Trigger:** When item modified — CarePlans — Status equals PendingApproval.

**Steps:**

1. Start and wait for an approval (Nursing Manager / Grace).
2. If Approved → Status = Active; set ApprovedBy/Date; notify author.
3. If Rejected → Status = Draft; comment in Notes.
4. Attach link to document — do not attach PHI file to email body.

---

## PA-07 — Incident High Severity

**Trigger:** Incidents created or Severity modified.

**Condition:** Severity in High, Critical OR IncidentType in Fall, Seizure, Elopement.

**Actions:**

1. Teams urgent post to Ops + Nursing.
2. Email leadership **with link only**.
3. If RegulatoryReportRequired — create task + due date 24h.
4. Ensure incident folder exists under client documents.

---

## PA-08 — Daily KPI Email

**Trigger:** 07:00 local.

**Data:** Prefer Power BI REST “alert” or pre-aggregated **KPI Snapshot** list updated by a prior flow / Power BI dataflow.

**Email content (no PHI):**

- Yesterday census / occupancy %
- Present count vs authorized
- Open high incidents
- Assessments overdue count
- Billing drafts pending

Template copy: [`../power-automate/templates/daily-kpi-email.html`](../power-automate/templates/daily-kpi-email.html).

---

## PA-09 — Document label enforce

**Trigger:** File created in ClientDocuments.

**Actions:**

1. Ensure sensitivity label **Confidential – PHI** (via Purview auto-label or Graph if licensed).
2. If uploaded outside client folder pattern — move or notify Admin.
3. Versioning already on; optionally set content type (Assessment, Consent, etc.).

---

## Connection references (solution)

| Connection | Purpose |
|------------|---------|
| SharePoint | Lists + libraries |
| Office 365 Outlook | KPI / alerts |
| Microsoft Teams | Channel posts |
| Approvals | Care plans |
| Excel Online / Office Scripts | Optional CSV parse |

---

## ALM notes

- Build in **Dev** environment; export managed solution to Prod.
- Use `Environment variables`: `ClientHubSiteUrl`, `ClientDocumentsLibrary`, `KpiRecipients`.
- Service account: `automation@<tenant>` with SharePoint Contribute on Hub only — not Global Admin.
