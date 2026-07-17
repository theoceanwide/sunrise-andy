# Power BI pages — build checklist

## Dataset setup

1. Get Data → SharePoint Online List → Hub site  
2. Select: Centers, Clients, Attendance, BillingRecords, Assessments, Incidents, TransportTrips, Payers  
3. In Power Query:
   - Rename to Dim*/Fact* conventions
   - Remove MedicaidID, Address*, Note bodies from **Ops** query duplicates (keep in Finance-only dataset if needed)
   - Expand lookups to CenterCode / ClientNumber
4. Create DimDate (extended date table) and mark as date table  
5. Relationships: single direction, Dim → Fact on keys  
6. Paste measures from `../dax/measures.dax`  
7. Add RLS roles filtering DimCenter[CenterCode]

## Pages to create

| # | Page name | Audience |
|---|-----------|----------|
| 1 | Executive Ops | Joe, Grace, Leadership |
| 2 | Attendance & Census | Front desk, Nursing |
| 3 | Billing & Revenue | Billing only |
| 4 | Transport | Transport lead, Drivers (aggregate) |
| 5 | Compliance | Nursing, Admin |
| 6 | Referrals & Enrollment | Leadership |

## Theme

Use Sunrise brand colors when available; avoid default purple templates. Suggested:

- Primary: `#0F4C5C`
- Accent: `#E36414`
- Background: `#F5F7F8`
- Text: `#1B1B1B`
