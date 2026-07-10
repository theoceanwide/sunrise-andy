import { pgTable, serial, text, timestamp, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "driver"]);
export const sessionStatusEnum = pgEnum("session_status", ["clocked_in", "clocked_out"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("driver"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vehicleInspections = pgTable("vehicle_inspections", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  checklist: jsonb("checklist").notNull().$type<InspectionChecklistItem[]>(),
  notes: text("notes"),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const driverSessions = pgTable("driver_sessions", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull().references(() => users.id),
  vehicleInspectionId: integer("vehicle_inspection_id").notNull().references(() => vehicleInspections.id),
  status: sessionStatusEnum("status").notNull().default("clocked_in"),
  clockInTime: timestamp("clock_in_time").notNull().defaultNow(),
  clockOutTime: timestamp("clock_out_time"),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(driverSessions),
  inspections: many(vehicleInspections),
}));

export const driverSessionsRelations = relations(driverSessions, ({ one }) => ({
  driver: one(users, { fields: [driverSessions.driverId], references: [users.id] }),
  inspection: one(vehicleInspections, {
    fields: [driverSessions.vehicleInspectionId],
    references: [vehicleInspections.id],
  }),
}));

export const vehicleInspectionsRelations = relations(vehicleInspections, ({ one }) => ({
  driver: one(users, { fields: [vehicleInspections.driverId], references: [users.id] }),
}));

// --- Vehicle inspection checklist definition ---

export const INSPECTION_ITEMS = [
  { key: "headlights", label: "Headlights" },
  { key: "parking_lights", label: "Parking lights" },
  { key: "turn_signals", label: "Turn signals" },
  { key: "brake_lights", label: "Brake lights" },
  { key: "emergency_flashers", label: "Emergency flashers" },
  { key: "backup_lights", label: "Backup lights" },
  { key: "tires", label: "Tires" },
  { key: "insurance_registration", label: "Insurance & registration on board" },
] as const;

export type InspectionItemKey = (typeof INSPECTION_ITEMS)[number]["key"];

export interface InspectionChecklistItem {
  key: InspectionItemKey;
  label: string;
  passed: boolean;
}

// --- Zod insert schemas ---

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1).optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

const inspectionChecklistItemSchema = z.object({
  key: z.enum(INSPECTION_ITEMS.map((i) => i.key) as [InspectionItemKey, ...InspectionItemKey[]]),
  label: z.string(),
  passed: z.boolean(),
});

export const insertVehicleInspectionSchema = createInsertSchema(vehicleInspections)
  .omit({ id: true, completedAt: true, passed: true })
  .extend({
    checklist: z.array(inspectionChecklistItemSchema).length(INSPECTION_ITEMS.length),
  });
export type InsertVehicleInspection = z.infer<typeof insertVehicleInspectionSchema>;
export type VehicleInspection = typeof vehicleInspections.$inferSelect;

export const insertDriverSessionSchema = createInsertSchema(driverSessions).omit({
  id: true,
  clockInTime: true,
  clockOutTime: true,
  status: true,
});
export type InsertDriverSession = z.infer<typeof insertDriverSessionSchema>;
export type DriverSession = typeof driverSessions.$inferSelect;

export interface DriverSessionWithInspection extends DriverSession {
  inspection: VehicleInspection;
}
