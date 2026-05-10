import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { explorationLogs } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/exploration-logs", async (req, res) => {
  try {
    const { locationId, userId } = req.query as { locationId?: string; userId?: string };
    if (!locationId || !userId) {
      res.status(400).json({ error: "locationId and userId are required" });
      return;
    }
    const rows = await db
      .select()
      .from(explorationLogs)
      .where(and(eq(explorationLogs.locationId, locationId), eq(explorationLogs.userId, userId)))
      .orderBy(desc(explorationLogs.visitedAt));
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch exploration logs");
    res.status(500).json({ error: "Failed to fetch exploration logs" });
  }
});

router.post("/exploration-logs", async (req, res) => {
  try {
    const { userId, locationId, notes, visitedAt, photoUrl } = req.body as {
      userId: string;
      locationId: string;
      notes: string;
      visitedAt: string;
      photoUrl?: string | null;
    };
    const [row] = await db.insert(explorationLogs).values({
      userId,
      locationId,
      notes: notes ?? "",
      visitedAt,
      photoUrl: photoUrl ?? null,
    }).returning();
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "Failed to create exploration log");
    res.status(500).json({ error: "Failed to create exploration log" });
  }
});

router.delete("/exploration-logs/:logId", async (req, res) => {
  try {
    const { logId } = req.params;
    await db.delete(explorationLogs).where(eq(explorationLogs.id, logId));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete exploration log");
    res.status(500).json({ error: "Failed to delete exploration log" });
  }
});

export default router;
