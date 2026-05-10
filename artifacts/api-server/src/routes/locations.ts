import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { locations, savedLocations, exploredLocations, users } from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/locations", async (req, res) => {
  try {
    const rows = await db.select().from(locations).orderBy(locations.createdAt);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch locations");
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.post("/locations", async (req, res) => {
  try {
    const body = req.body as {
      name: string;
      category: string;
      latitude: number;
      longitude: number;
      description: string;
      abandonmentScore: number;
      riskLevel: string;
      lastVisited?: string;
      submittedBy?: string;
    };
    const [row] = await db.insert(locations).values({
      name: body.name,
      category: body.category,
      latitude: body.latitude,
      longitude: body.longitude,
      description: body.description,
      abandonmentScore: body.abandonmentScore,
      riskLevel: body.riskLevel,
      lastVisited: body.lastVisited ?? null,
      submittedBy: body.submittedBy ?? null,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "Failed to create location");
    res.status(500).json({ error: "Failed to create location" });
  }
});

router.get("/users/:userId/locations", async (req, res) => {
  try {
    const { userId } = req.params;

    const [savedRows, exploredRows, submittedRows] = await Promise.all([
      db.select({ locationId: savedLocations.locationId })
        .from(savedLocations)
        .where(eq(savedLocations.userId, userId)),
      db.select({ locationId: exploredLocations.locationId })
        .from(exploredLocations)
        .where(eq(exploredLocations.userId, userId)),
      db.select().from(locations).where(eq(locations.submittedBy, userId)),
    ]);

    const savedIds = savedRows.map(r => r.locationId);
    const exploredIds = exploredRows.map(r => r.locationId);

    const [savedLocs, exploredLocs] = await Promise.all([
      savedIds.length > 0 ? db.select().from(locations).where(inArray(locations.id, savedIds)) : Promise.resolve([]),
      exploredIds.length > 0 ? db.select().from(locations).where(inArray(locations.id, exploredIds)) : Promise.resolve([]),
    ]);

    res.json({ saved: savedLocs, explored: exploredLocs, submitted: submittedRows });
  } catch (err) {
    logger.error({ err }, "Failed to fetch user locations");
    res.status(500).json({ error: "Failed to fetch user locations" });
  }
});

router.get("/users/:userId/saved-ids", async (req, res) => {
  try {
    const { userId } = req.params;
    const [saved, explored] = await Promise.all([
      db.select({ locationId: savedLocations.locationId }).from(savedLocations).where(eq(savedLocations.userId, userId)),
      db.select({ locationId: exploredLocations.locationId }).from(exploredLocations).where(eq(exploredLocations.userId, userId)),
    ]);
    res.json({
      savedIds: saved.map(r => r.locationId),
      exploredIds: explored.map(r => r.locationId),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch user location ids");
    res.status(500).json({ error: "Failed to fetch user location ids" });
  }
});

router.post("/users/:userId/saved", async (req, res) => {
  try {
    const { userId } = req.params;
    const { locationId } = req.body as { locationId: number };
    await db.insert(savedLocations).values({ userId, locationId }).onConflictDoNothing();
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to save location");
    res.status(500).json({ error: "Failed to save location" });
  }
});

router.delete("/users/:userId/saved/:locationId", async (req, res) => {
  try {
    const { userId, locationId } = req.params;
    await db.delete(savedLocations).where(
      and(eq(savedLocations.userId, userId), eq(savedLocations.locationId, Number(locationId)))
    );
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to unsave location");
    res.status(500).json({ error: "Failed to unsave location" });
  }
});

router.post("/users/:userId/explored", async (req, res) => {
  try {
    const { userId } = req.params;
    const { locationId } = req.body as { locationId: number };
    await db.insert(exploredLocations).values({ userId, locationId }).onConflictDoNothing();
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to mark explored");
    res.status(500).json({ error: "Failed to mark explored" });
  }
});

router.delete("/users/:userId/explored/:locationId", async (req, res) => {
  try {
    const { userId, locationId } = req.params;
    await db.delete(exploredLocations).where(
      and(eq(exploredLocations.userId, userId), eq(exploredLocations.locationId, Number(locationId)))
    );
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to unmark explored");
    res.status(500).json({ error: "Failed to unmark explored" });
  }
});

router.delete("/locations/:locationId", async (req, res) => {
  try {
    const { locationId } = req.params;
    await db.delete(locations).where(eq(locations.id, Number(locationId)));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete location");
    res.status(500).json({ error: "Failed to delete location" });
  }
});

router.patch("/locations/:locationId/verification", async (req, res) => {
  try {
    const { locationId } = req.params;
    logger.info({ locationId }, "Verification state update not supported in current schema — ignoring");
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to update verification state");
    res.status(500).json({ error: "Failed to update verification state" });
  }
});

router.post("/users/upsert", async (req, res) => {
  try {
    const { id, email, name } = req.body as { id: string; email?: string; name?: string };
    const [user] = await db.insert(users).values({ id, email, name }).onConflictDoUpdate({
      target: users.id,
      set: { email, name },
    }).returning();
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Failed to upsert user");
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

export default router;
