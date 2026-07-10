# Sunrise Driver Check-In

Standalone driver clock-in app for Sunrise Senior Daycare's transportation team. Drivers sign in as a separate (`driver`-role) user, complete a required 8-point daily vehicle safety inspection, and are clocked in only once every item passes.

This is scoped intentionally: login + vehicle inspection + clock-in/clock-out. It does not include GPS tracking, dispatch/admin tooling, SMS/voice notifications, or route management — those were part of a larger Replit prototype spec but are out of scope for this build. It's built standalone (own DB/auth) since it doesn't yet have API access to the live checkin.sunriseseniordaycare.com app; wiring the two together is future work once integration details are available.

## Stack

- Client: React + TypeScript, Vite, Tailwind CSS, shadcn-style UI components
- Server: Node.js + Express + TypeScript (ESM)
- Database: PostgreSQL + Drizzle ORM, schema shared between client/server (`shared/schema.ts`)

## Local setup

1. `npm install`
2. Create a Postgres database and copy `.env.example` to `.env` with its `DATABASE_URL`
3. `npm run db:push` to create tables
4. `npm run dev` — runs the Express server with Vite in middleware mode on `http://localhost:5000`

## Flow

1. **Sign in** — `POST /api/auth/login` looks up the driver by username; auto-creates the user (role `driver`) on first login.
2. **Begin Shift** — driver taps through to the vehicle inspection.
3. **Vehicle Inspection** — 8 required checks (headlights, parking lights, turn signals, brake lights, emergency flashers, backup lights, tires, insurance/registration). The checklist is local component state, so it always resets on refresh — drivers can't carry over a stale check across a shift.
4. **Clock-in** — `POST /api/drivers/:id/clock-in` accepts the checklist. If every item passed, it atomically records the inspection and opens a `driver_sessions` row (`status: clocked_in`). If any item failed, the inspection is still recorded for audit purposes but the clock-in is rejected (422) so the driver can't start a shift with a flagged vehicle.
5. **Clocked in** — shows shift status and a **Clock Out** button (`POST /api/drivers/:id/clock-out`).

Session state is source-of-truth on the server (`GET /api/drivers/:id/session`); the client re-checks it on load so a driver who reloads mid-shift lands back on the clocked-in screen instead of re-doing the inspection.

## API

```
POST /api/auth/login                    { username, password, name? } -> { id, username, name, role }
GET  /api/drivers/:id/session           -> active clocked_in session + inspection, or null
POST /api/drivers/:id/clock-in          { checklist: InspectionChecklistItem[8] } -> session+inspection (201) or 422 if any item failed
POST /api/drivers/:id/clock-out         -> updated session
GET  /api/inspection-items              -> the 8 required checklist items
GET  /healthz                           -> { ok, db, timestamp }
```

## Not yet built (flagged for follow-up)

- Admin/dispatcher view of driver clock-in status and inspection results
- Real auth (password hashing) — current MVP auto-creates users like the original spec, structured so hashing can be added later
- Integration with the live checkin.sunriseseniordaycare.com app
