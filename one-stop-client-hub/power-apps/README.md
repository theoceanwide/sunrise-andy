# Power Apps — mobile starters (Phase 1)

Thin canvas apps over SharePoint Lists. Prefer **Teams-embedded** apps for staff.

## App 1 — Attendance Quick Mark

**Users:** Front desk, Nursing  
**Data:** Clients (Active view), Attendance  

Screens:

1. **Home** — Center selector (DEN/HOU), today’s date  
2. **Roster** — gallery of Active clients authorized today  
3. **Mark** — Present / Absent / Excused / Partial + optional check-in time  
4. **Confirm** — patch Attendance (create or update by ClientNumber+Date)

Formula sketch (OnSelect Present):

```powerfx
Patch(
    Attendance,
    Defaults(Attendance),
    {
        Title: ClientNumberGallery.Selected.ClientNumber & "-" & Text(Today(), "yyyymmdd"),
        Client: ClientNumberGallery.Selected,
        ClientNumber: ClientNumberGallery.Selected.ClientNumber,
        AttendanceDate: Today(),
        Status: { Value: "Present" },
        CheckInTime: Now(),
        Source: { Value: "Manual" },
        RecordedBy: User()
    }
)
```

## App 2 — Driver Trip Assist

**Users:** Drivers  
**Data:** TransportTrips, Clients (limited columns)  

Screens:

1. Login via Entra (Teams)  
2. Today’s pickup list  
3. Complete / NoShow + notes  
4. Optional deep-link to vehicle inspection app (existing driver check-in work)

**Do not** show MedicaidID or DOB on driver screens.

## App 3 — Incident Quick Log

**Users:** All care staff  
**Data:** Incidents  

Large buttons for Fall / Seizure / Elopement; Severity default Medium; PA-07 handles High/Critical alerts.

## Packaging

- Add apps to solution `SunriseClientHub`
- Use environment variables for list IDs
- Ship phone layout first; tablet optional
