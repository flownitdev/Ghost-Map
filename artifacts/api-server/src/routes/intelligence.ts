import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { intelligenceCandidates } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface AICandidate {
  name: string;
  locationHint: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  confidenceScore: number;
  aiReasoning: string;
  sourceSignals: string[];
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

// ─── GET /api/intelligence/candidates ─────────────────────────────────────────
router.get("/intelligence/candidates", async (req, res) => {
  try {
    const status = (req.query.status as string) ?? "pending";
    const rows = await db
      .select()
      .from(intelligenceCandidates)
      .where(status === "all" ? undefined : eq(intelligenceCandidates.status, status))
      .orderBy(desc(intelligenceCandidates.scannedAt));
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch intelligence candidates");
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// ─── POST /api/intelligence/scan ──────────────────────────────────────────────
router.post("/intelligence/scan", async (req, res) => {
  const { query, region } = req.body as { query?: string; region?: string };

  const searchContext = query?.trim() || "dead malls, closed factories, abandoned hospitals, shuttered schools";
  const regionCtx = region?.trim() || "globally (focus on USA, UK, France, Germany, Eastern Europe)";

  const prompt = `You are an urban exploration (urbex) intelligence analyst with deep knowledge of abandoned places worldwide.

Your task: identify ${clamp(Number(req.body.count ?? 6), 3, 12)} real or plausible abandoned locations based on these signals:
- Search focus: ${searchContext}
- Region: ${regionCtx}

Use your knowledge of:
- Dead mall phenomenon and retail closures
- Deindustrialisation and factory closures
- Hospital and asylum closures
- School and government building abandonments
- Local news patterns about closures and "permanently closed" businesses
- Known urbex hotspots and recent discoveries

For each candidate, generate a realistic intelligence assessment. Return ONLY a valid JSON array:
[
  {
    "name": "Exact or plausible location name",
    "locationHint": "City, region, country — as specific as possible",
    "latitude": <decimal or null if unknown>,
    "longitude": <decimal or null if unknown>,
    "category": <one of: "factory" | "hospital" | "mall" | "school" | "tunnel" | "industrial">,
    "confidenceScore": <integer 30-95, based on how many signals confirm abandonment>,
    "aiReasoning": "2-3 sentence intelligence summary explaining WHY this location is flagged as potentially abandoned. Reference specific signals: closure announcements, news reports, business closure patterns, satellite imagery descriptions, community reports.",
    "sourceSignals": ["array", "of", "signal", "types", "detected", "e.g.", "local news closure", "Google Maps permanently closed", "community forum reports", "satellite decay visible", "company bankruptcy filing"]
  }
]

Vary confidence scores realistically. High scores (80+) for confirmed closures with multiple signals. Medium (50-79) for probable but unconfirmed. Lower (30-49) for speculative based on patterns only.
Return ONLY the JSON array, no markdown, no commentary.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const rawText = response.text ?? "[]";
    let candidates: AICandidate[];
    try {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
      candidates = JSON.parse(cleaned) as AICandidate[];
      if (!Array.isArray(candidates)) throw new Error("Not an array");
    } catch {
      logger.warn("Failed to parse Gemini intelligence scan response");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const inserted = await Promise.all(
      candidates.map(async (c) => {
        const [row] = await db
          .insert(intelligenceCandidates)
          .values({
            name: c.name ?? "Unknown Location",
            locationHint: c.locationHint ?? "Unknown region",
            latitude: typeof c.latitude === "number" ? c.latitude : null,
            longitude: typeof c.longitude === "number" ? c.longitude : null,
            category: c.category ?? "industrial",
            confidenceScore: clamp(c.confidenceScore ?? 50, 0, 100),
            aiReasoning: c.aiReasoning ?? "",
            sourceSignals: Array.isArray(c.sourceSignals) ? c.sourceSignals : [],
            status: "pending",
          })
          .returning();
        return row;
      })
    );

    logger.info({ count: inserted.length }, "Intelligence scan completed");
    res.json({ count: inserted.length, candidates: inserted });
  } catch (err) {
    logger.error({ err }, "Intelligence scan failed");
    res.status(500).json({ error: "Intelligence scan failed" });
  }
});

// ─── PATCH /api/intelligence/candidates/:id ────────────────────────────────────
router.patch("/intelligence/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy } = req.body as { status: "approved" | "rejected"; reviewedBy?: string };

    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ error: "status must be approved or rejected" });
      return;
    }

    const [row] = await db
      .update(intelligenceCandidates)
      .set({
        status,
        reviewedBy: reviewedBy ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(intelligenceCandidates.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to update candidate");
    res.status(500).json({ error: "Failed to update candidate" });
  }
});

// ─── DELETE /api/intelligence/candidates/:id ───────────────────────────────────
router.delete("/intelligence/candidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(intelligenceCandidates).where(eq(intelligenceCandidates.id, id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete candidate");
    res.status(500).json({ error: "Failed to delete candidate" });
  }
});

export default router;
