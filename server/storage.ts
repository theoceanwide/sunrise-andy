import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  driverSessions,
  vehicleInspections,
  type User,
  type InsertUser,
  type InsertVehicleInspection,
  type VehicleInspection,
  type DriverSession,
  type DriverSessionWithInspection,
} from "../shared/schema";

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getOrCreateUser(username: string, role: "admin" | "driver", name?: string): Promise<User>;

  createVehicleInspection(inspection: InsertVehicleInspection, passed: boolean): Promise<VehicleInspection>;

  createDriverSession(driverId: number, vehicleInspectionId: number): Promise<DriverSession>;
  getActiveSessionForDriver(driverId: number): Promise<DriverSessionWithInspection | undefined>;
  clockOutSession(sessionId: number): Promise<DriverSession | undefined>;
  getSessionWithInspection(sessionId: number): Promise<DriverSessionWithInspection | undefined>;
}

class DbStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrCreateUser(username: string, role: "admin" | "driver", name?: string): Promise<User> {
    const existing = await this.getUserByUsername(username);
    if (existing) return existing;
    return this.createUser({
      username,
      password: "",
      name: name || username,
      role,
    });
  }

  async createVehicleInspection(
    inspection: InsertVehicleInspection,
    passed: boolean,
  ): Promise<VehicleInspection> {
    const [record] = await db
      .insert(vehicleInspections)
      .values({ ...inspection, passed })
      .returning();
    return record;
  }

  async createDriverSession(driverId: number, vehicleInspectionId: number): Promise<DriverSession> {
    const [session] = await db
      .insert(driverSessions)
      .values({ driverId, vehicleInspectionId })
      .returning();
    return session;
  }

  async getActiveSessionForDriver(driverId: number): Promise<DriverSessionWithInspection | undefined> {
    const [row] = await db
      .select()
      .from(driverSessions)
      .innerJoin(vehicleInspections, eq(driverSessions.vehicleInspectionId, vehicleInspections.id))
      .where(and(eq(driverSessions.driverId, driverId), eq(driverSessions.status, "clocked_in")))
      .orderBy(driverSessions.id)
      .limit(1);
    if (!row) return undefined;
    return { ...row.driver_sessions, inspection: row.vehicle_inspections };
  }

  async clockOutSession(sessionId: number): Promise<DriverSession | undefined> {
    const [session] = await db
      .update(driverSessions)
      .set({ status: "clocked_out", clockOutTime: new Date() })
      .where(and(eq(driverSessions.id, sessionId), eq(driverSessions.status, "clocked_in")))
      .returning();
    return session;
  }

  async getSessionWithInspection(sessionId: number): Promise<DriverSessionWithInspection | undefined> {
    const [row] = await db
      .select()
      .from(driverSessions)
      .innerJoin(vehicleInspections, eq(driverSessions.vehicleInspectionId, vehicleInspections.id))
      .where(eq(driverSessions.id, sessionId));
    if (!row) return undefined;
    return { ...row.driver_sessions, inspection: row.vehicle_inspections };
  }
}

export const storage: IStorage = new DbStorage();
