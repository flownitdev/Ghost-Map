import { pgTable, text, serial, integer, real, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description").notNull(),
  abandonmentScore: integer("abandonment_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  lastVisited: text("last_visited"),
  submittedBy: text("submitted_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const exploredLocations = pgTable("explored_locations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const locationAnalysis = pgTable("location_analysis", {
  id: serial("id").primaryKey(),
  locationId: text("location_id").notNull().unique(),
  summary: text("summary").notNull(),
  abandonmentScore: integer("abandonment_score").notNull(),
  decayLevel: integer("decay_level").notNull(),
  structuralIntegrity: integer("structural_integrity").notNull(),
  activityLevel: integer("activity_level").notNull(),
  explorationDifficulty: integer("exploration_difficulty").notNull(),
  aiConfidence: integer("ai_confidence").notNull(),
  roofDeterioration: integer("roof_deterioration").notNull(),
  vegetationOvergrowth: integer("vegetation_overgrowth").notNull(),
  parkingDecay: integer("parking_decay").notNull(),
  riskEstimate: text("risk_estimate").notNull(),
  generatedAt: timestamp("generated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const intelligenceCandidates = pgTable("intelligence_candidates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  locationHint: text("location_hint").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  category: text("category").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  aiReasoning: text("ai_reasoning").notNull(),
  sourceSignals: jsonb("source_signals").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  scannedAt: timestamp("scanned_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertLocationAnalysisSchema = createInsertSchema(locationAnalysis).omit({ id: true, generatedAt: true });

export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type SavedLocation = typeof savedLocations.$inferSelect;
export type ExploredLocation = typeof exploredLocations.$inferSelect;
export type LocationAnalysis = typeof locationAnalysis.$inferSelect;
export type IntelligenceCandidate = typeof intelligenceCandidates.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
