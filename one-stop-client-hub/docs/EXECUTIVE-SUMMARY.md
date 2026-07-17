# Executive summary — One Stop Client Hub

**For:** Joe (leadership), Grace (ops), Andy (implementation)  
**Org:** Sunrise Senior Daycare / Autumn Day Care LLC  
**Source system:** myadultdaycare.com  

## What we’re building

A Microsoft 365 **Client Hub** that becomes the operational home for client records, documents, attendance, billing visibility, care-plan approvals, incidents, and Power BI ops reporting — with HIPAA-oriented controls (BAA, MFA, RBAC, sensitivity labels, audit).

## Tooling recommendation

| Need | Phase 1 | Phase 2 (if needed) |
|------|---------|---------------------|
| Structured data | SharePoint Lists | Dataverse |
| Documents / PHI files | SharePoint libraries + labels | Same |
| Automation | Power Automate | + ADF if heavy ELT |
| Dashboards | Power BI | Same + Premium if scale |
| Mobile | Power Apps in Teams | Same |

**Start Lists-first** unless you already own Dataverse capacity or expect >50k attendance rows/year with complex security roles.

## Delivery sequence

1. Security baseline (BAA, groups, labels, audit)  
2. Provision Hub site (PnP script)  
3. Map + pilot import (10 clients)  
4. Full load + Power BI v1  
5. Parallel run → cutover  
6. Mobile apps + remaining flows  

## Repo pack

All architecture, schemas, migration maps, flow stubs, DAX, and checklists live under `/one-stop-client-hub/`.

**Open questions:** `00-assumptions-and-questions.md` — answer these to lock licensing and cutover.
