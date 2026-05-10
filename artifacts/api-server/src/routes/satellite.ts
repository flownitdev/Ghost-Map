import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ─── Tile math ────────────────────────────────────────────────────────────────

function latLngToTile(lat: number, lng: number, zoom: number) {
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  return { x, y };
}

function tileToLatLng(tx: number, ty: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lng = (tx / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * ty) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

// ─── Tile fetching ────────────────────────────────────────────────────────────

async function fetchTileBase64(z: number, ty: number, tx: number): Promise<string> {
  const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "GhostMap-SatScanner/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching tile ${z}/${ty}/${tx}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  return buf.toString("base64");
}

// ─── Tile analysis ────────────────────────────────────────────────────────────

export interface TileAnalysis {
  tileX: number;
  tileY: number;
  zoom: number;
  lat: number;
  lng: number;
  latSE: number;
  lngSE: number;
  centerLat: number;
  centerLng: number;
  confidenceScore: number;
  decayLevel: number;
  indicators: string[];
  reasoning: string;
}

async function analyzeTile(zoom: number, tx: number, ty: number): Promise<TileAnalysis | null> {
  const nw = tileToLatLng(tx, ty, zoom);
  const se = tileToLatLng(tx + 1, ty + 1, zoom);
  const centerLat = (nw.lat + se.lat) / 2;
  const centerLng = (nw.lng + se.lng) / 2;

  let base64Data: string;
  try {
    base64Data = await fetchTileBase64(zoom, ty, tx);
  } catch (err) {
    logger.warn({ err, tx, ty, zoom }, "Satellite tile fetch failed");
    return null;
  }

  const prompt = `You are an urban decay intelligence analyst for GhostMap, an urban exploration network.

Analyze this satellite imagery tile for signs of building abandonment or structural neglect. Look for:
- Roof deterioration: discoloration, moss/algae streaks, missing sections, sagging
- Vegetation overgrowth: trees growing into structures, heavily overgrown lots, nature reclaiming spaces
- Empty or cracked parking lots: no vehicles, weeds through asphalt, faded markings
- Isolated industrial/commercial buildings: large structures with no activity around them
- Lack of vehicle or foot traffic: empty lots, no shadows from parked cars
- Structural decay: collapsed sections, exposed framing, broken roof elements visible from above
- General neglect: debris piles, rust patterns, deteriorated access roads

Return ONLY valid JSON, no markdown, no commentary:
{
  "confidenceScore": <integer 0-100: probability this tile contains abandoned or severely neglected structures>,
  "decayLevel": <integer 0-100: severity of observed decay if present>,
  "indicators": [<up to 5 short string labels of specific observed signals>],
  "reasoning": "<one punchy sentence: the primary piece of evidence you saw, or why this area looks active>"
}

Be calibrated: most tiles will score low (0-20). Only score above 50 when you see multiple clear abandonment signals. Score above 80 only for obvious derelict sites.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: prompt },
          ],
        },
      ],
      config: { maxOutputTokens: 512, responseMimeType: "application/json" },
    });

    const raw = (response.text ?? "{}").replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(raw) as {
      confidenceScore?: number;
      decayLevel?: number;
      indicators?: string[];
      reasoning?: string;
    };

    return {
      tileX: tx, tileY: ty, zoom,
      lat: nw.lat, lng: nw.lng,
      latSE: se.lat, lngSE: se.lng,
      centerLat, centerLng,
      confidenceScore: Math.max(0, Math.min(100, Math.round(parsed.confidenceScore ?? 0))),
      decayLevel: Math.max(0, Math.min(100, Math.round(parsed.decayLevel ?? 0))),
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators.slice(0, 5) : [],
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
    };
  } catch (err) {
    logger.warn({ err, tx, ty, zoom }, "Gemini Vision analysis failed for tile");
    return null;
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/satellite/scan", async (req, res) => {
  const { lat, lng, zoom: rawZoom, halfGrid: rawHalf } = req.body as {
    lat?: number;
    lng?: number;
    zoom?: number;
    halfGrid?: number;
  };

  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "lat and lng are required numbers" });
    return;
  }

  const zoom = Math.min(17, Math.max(14, Math.round(rawZoom ?? 16)));
  const halfGrid = Math.min(1, Math.max(0, Math.round(rawHalf ?? 1)));

  const center = latLngToTile(lat, lng, zoom);
  const tiles: { x: number; y: number }[] = [];

  for (let dy = -halfGrid; dy <= halfGrid; dy++) {
    for (let dx = -halfGrid; dx <= halfGrid; dx++) {
      tiles.push({ x: center.x + dx, y: center.y + dy });
    }
  }

  logger.info({ lat, lng, zoom, tileCount: tiles.length }, "Satellite scan started");

  const analysisResults = await Promise.all(
    tiles.map((t) => analyzeTile(zoom, t.x, t.y))
  );

  const valid = analysisResults.filter(Boolean) as TileAnalysis[];
  const flagged = valid
    .filter((r) => r.confidenceScore >= 25)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  logger.info(
    { tilesScanned: valid.length, flagged: flagged.length },
    "Satellite scan complete"
  );

  res.json({ zoom, centerLat: lat, centerLng: lng, tilesScanned: valid.length, results: valid, flagged });
});

export default router;
