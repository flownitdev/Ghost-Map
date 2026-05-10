import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface LocationAnalysisRequest {
  locationId: string;
  name: string;
  category: string;
  description: string;
  riskLevel: string;
  abandonmentScore: number;
  lastVisited?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationAnalysis {
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
}

router.post("/ai/analyze", async (req, res) => {
  const body = req.body as LocationAnalysisRequest;

  if (!body.locationId || !body.name || !body.category) {
    res.status(400).json({ error: "locationId, name, and category are required" });
    return;
  }

  const prompt = `You are an urban exploration (urbex) intelligence analyst. Analyze this abandoned location and return ONLY a valid JSON object.

Location details:
- Name: ${body.name}
- Category: ${body.category}
- Known Risk Level: ${body.riskLevel}
- Abandonment Score (known): ${body.abandonmentScore}/100
- Last Known Visit: ${body.lastVisited ?? "Unknown"}
- Description: ${body.description ?? "No description available"}

Generate an immersive urbex intelligence report. Return ONLY this JSON structure, no markdown, no extra text:
{
  "summary": "A 2-3 sentence immersive urbex intelligence summary in present tense. Describe the site's decay, atmosphere, and current state. Use cinematic, evocative language like a real urban explorer would write.",
  "abandonmentScore": <integer 0-100, aligned with known score but refined>,
  "decayLevel": <integer 0-100, how decayed/deteriorated>,
  "structuralIntegrity": <integer 0-100, higher = more structurally sound>,
  "activityLevel": <integer 0-100, signs of human activity or trespassing>,
  "explorationDifficulty": <integer 0-100, higher = harder to explore>,
  "aiConfidence": <integer 65-98, AI confidence in this analysis>,
  "roofDeterioration": <integer 0-100>,
  "vegetationOvergrowth": <integer 0-100>,
  "parkingDecay": <integer 0-100, if applicable to this location type>,
  "riskEstimate": "${body.riskLevel}"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192, responseMimeType: "application/json" },
    });

    const rawText = response.text ?? "{}";

    let analysis: LocationAnalysis;
    try {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
      analysis = JSON.parse(cleaned) as LocationAnalysis;
    } catch {
      logger.warn({ locationId: body.locationId }, "Failed to parse Gemini JSON response");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const result = {
      locationId: body.locationId,
      summary: analysis.summary ?? "",
      abandonmentScore: clamp(analysis.abandonmentScore ?? body.abandonmentScore, 0, 100),
      decayLevel: clamp(analysis.decayLevel ?? 50, 0, 100),
      structuralIntegrity: clamp(analysis.structuralIntegrity ?? 50, 0, 100),
      activityLevel: clamp(analysis.activityLevel ?? 20, 0, 100),
      explorationDifficulty: clamp(analysis.explorationDifficulty ?? 50, 0, 100),
      aiConfidence: clamp(analysis.aiConfidence ?? 80, 0, 100),
      roofDeterioration: clamp(analysis.roofDeterioration ?? 50, 0, 100),
      vegetationOvergrowth: clamp(analysis.vegetationOvergrowth ?? 50, 0, 100),
      parkingDecay: clamp(analysis.parkingDecay ?? 40, 0, 100),
      riskEstimate: analysis.riskEstimate ?? body.riskLevel,
    };

    req.log.info({ locationId: body.locationId }, "AI analysis generated");
    res.json(result);
  } catch (err) {
    logger.error({ err, locationId: body.locationId }, "Gemini API error");
    res.status(500).json({ error: "AI analysis failed" });
  }
});

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export default router;
