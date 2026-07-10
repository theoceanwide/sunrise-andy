import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { pool } from "./db";
import { loginSchema, insertVehicleInspectionSchema, INSPECTION_ITEMS } from "../shared/schema";

function handleZodError(res: Response, error: any) {
  if (error?.errors) {
    return res.status(400).json({ error: error.errors });
  }
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
}

export function registerRoutes(app: Express) {
  app.get("/healthz", async (_req: Request, res: Response) => {
    try {
      await pool.query("SELECT 1");
      res.json({ ok: true, db: true, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ ok: false, db: false, timestamp: new Date().toISOString() });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const input = loginSchema.parse(req.body);
      const user = await storage.getOrCreateUser(input.username, "driver", input.name);
      res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (error) {
      handleZodError(res, error);
    }
  });

  app.get("/api/drivers/:id/session", async (req: Request, res: Response) => {
    const driverId = Number(req.params.id);
    if (Number.isNaN(driverId)) return res.status(400).json({ error: "Invalid driver id" });
    const session = await storage.getActiveSessionForDriver(driverId);
    res.json(session ?? null);
  });

  app.get("/api/inspection-items", (_req: Request, res: Response) => {
    res.json(INSPECTION_ITEMS);
  });

  app.post("/api/drivers/:id/clock-in", async (req: Request, res: Response) => {
    const driverId = Number(req.params.id);
    if (Number.isNaN(driverId)) return res.status(400).json({ error: "Invalid driver id" });

    try {
      const driver = await storage.getUser(driverId);
      if (!driver) return res.status(404).json({ error: "Driver not found" });

      const existing = await storage.getActiveSessionForDriver(driverId);
      if (existing) {
        return res.status(409).json({ error: "Driver is already clocked in", session: existing });
      }

      const input = insertVehicleInspectionSchema.parse({ ...req.body, driverId });
      const allPassed = input.checklist.every((item: { passed: boolean }) => item.passed);

      const inspection = await storage.createVehicleInspection(input, allPassed);

      if (!allPassed) {
        return res.status(422).json({
          error: "Vehicle inspection failed. Resolve the flagged items before clocking in.",
          inspection,
        });
      }

      const session = await storage.createDriverSession(driverId, inspection.id);
      res.status(201).json({ ...session, inspection });
    } catch (error) {
      handleZodError(res, error);
    }
  });

  app.post("/api/drivers/:id/clock-out", async (req: Request, res: Response) => {
    const driverId = Number(req.params.id);
    if (Number.isNaN(driverId)) return res.status(400).json({ error: "Invalid driver id" });

    try {
      const active = await storage.getActiveSessionForDriver(driverId);
      if (!active) return res.status(404).json({ error: "No active session for this driver" });

      const session = await storage.clockOutSession(active.id);
      res.json(session);
    } catch (error) {
      handleZodError(res, error);
    }
  });
}
