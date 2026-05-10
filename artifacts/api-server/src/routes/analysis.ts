import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { locationAnalysis } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/analysis/:locationId", async (req, res) => {
  try {
    const { locationId } = req.params;
    const [row] = await db.select().from(locationAnalysis).where(eq(locationAnalysis.locationId, locationId));
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      locationId: row.locationId,
      summary: row.summary,
      abandonmentScore: row.abandonmentScore,
      decayLevel: row.decayLevel,
      structuralIntegrity: row.structuralIntegrity,
      activityLevel: row.activityLevel,
      explorationDifficulty: row.explorationDifficulty,
      aiConfidence: row.aiConfidence,
      roofDeterioration: row.roofDeterioration,
      vegetationOvergrowth: row.vegetationOvergrowth,
      parkingDecay: row.parkingDecay,
      riskEstimate: row.riskEstimate,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch analysis");
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});

router.post("/analysis", async (req, res) => {
  try {
    const body = req.body as {
      locationId: string;
      summary: string;
      abandonmentScore: number;
      decayLevel: number;
      structuralIntegrity: number;
      activityLevel: number;
      explorationDifficulty: number;
      aiConfidence: number;
      roofDeterioration: number;
      vegetationOvergrowth: number;
      parkingDecay: number;
      riskEstimate: string;
    };

    const [row] = await db.insert(locationAnalysis).values({
      locationId: body.locationId,
      summary: body.summary,
      abandonmentScore: body.abandonmentScore,
      decayLevel: body.decayLevel,
      structuralIntegrity: body.structuralIntegrity,
      activityLevel: body.activityLevel,
      explorationDifficulty: body.explorationDifficulty,
      aiConfidence: body.aiConfidence,
      roofDeterioration: body.roofDeterioration,
      vegetationOvergrowth: body.vegetationOvergrowth,
      parkingDecay: body.parkingDecay,
      riskEstimate: body.riskEstimate,
    }).onConflictDoUpdate({
      target: locationAnalysis.locationId,
      set: {
        summary: body.summary,
        abandonmentScore: body.abandonmentScore,
        decayLevel: body.decayLevel,
        structuralIntegrity: body.structuralIntegrity,
        activityLevel: body.activityLevel,
        explorationDifficulty: body.explorationDifficulty,
        aiConfidence: body.aiConfidence,
        roofDeterioration: body.roofDeterioration,
        vegetationOvergrowth: body.vegetationOvergrowth,
        parkingDecay: body.parkingDecay,
        riskEstimate: body.riskEstimate,
      },
    }).returning();

    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to save analysis");
    res.status(500).json({ error: "Failed to save analysis" });
  }
});

export default router;
