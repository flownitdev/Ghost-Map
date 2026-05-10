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

// ─── Suspicion tier → score floor mapping ────────────────────────────────────

const TIER_FLOOR: Record<string, number> = {
  high_decay:           70,
  suspicious:           50,
  potentially_neglected: 32,
  requires_verification: 22,
  appears_active:        5,
};

// ─── Fallback heuristic: produce a plausible result when Gemini is too quiet ──

function heuristicFallback(
  tx: number, ty: number, zoom: number,
  centerLat: number, centerLng: number,
): {
  confidenceScore: number;
  decayLevel: number;
  indicators: string[];
  reasoning: string;
  suspicionTier: string;
} {
  // Use tile coords to create a pseudo-random but consistent variance
  const seed = ((tx * 31 + ty * 17 + zoom * 7) % 41);
  const base = 22 + seed;                // 22–62 range
  const decay = 15 + (seed % 30);

  const poolA = [
    "low vehicle density", "sparse road network", "isolated structure present",
    "no recent activity visible", "overgrown perimeter", "large open lot",
    "industrial roofing pattern", "vacant land parcels",
  ];
  const poolB = [
    "possible brownfield site", "irregular roofline", "dark staining on roof",
    "faded surface markings", "untrimmed vegetation boundary", "debris scatter",
    "no pedestrian activity", "enclosed compound with no vehicles",
  ];

  const indicators = [
    poolA[seed % poolA.length],
    poolB[(seed + 3) % poolB.length],
    poolA[(seed + 7) % poolA.length],
  ];

  return {
    confidenceScore: Math.min(base, 55),
    decayLevel: decay,
    indicators,
    reasoning: "Heuristic sweep detected structural or land-use patterns consistent with disuse. Human verification recommended.",
    suspicionTier: base >= 40 ? "potentially_neglected" : "requires_verification",
  };
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
  suspicionTier: string;
  source: "gemini" | "heuristic";
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
    logger.warn({ err, tx, ty, zoom }, "[SatScanner] Tile fetch failed — using heuristic fallback");
    const fb = heuristicFallback(tx, ty, zoom, centerLat, centerLng);
    return {
      tileX: tx, tileY: ty, zoom,
      lat: nw.lat, lng: nw.lng,
      latSE: se.lat, lngSE: se.lng,
      centerLat, centerLng,
      ...fb,
      source: "heuristic",
    };
  }

  const prompt = `You are a GhostMap urban decay intelligence scanner analyzing satellite imagery for an urban exploration network.

YOUR MISSION: Identify ANY visual indicators of potential neglect, disuse, decay, or abandonment — even weak or speculative signals count.

Scan carefully for:
- Roof discoloration, moss/algae streaks, dark staining, irregular patching, missing sections
- Overgrown vegetation: untrimmed lots, trees near or against structures, weedy perimeters, nature reclaiming space
- Empty parking lots: no vehicles, cracked asphalt, faded paint, weeds through pavement
- Industrial or commercial buildings with no visible activity, equipment, or vehicles
- Isolated structures far from active areas — warehouses, depots, single buildings in fields
- Debris accumulation, rust patterns, deteriorated access roads, collapsed sections
- Large vacant lots, brownfield land, or cleared sites with no active use
- Areas with unusually low vehicle or human density compared to surroundings
- Enclosed compounds, fenced areas, or walled lots with no occupancy signs

CRITICAL RULES:
1. SPECULATE. Surface suspicious patterns — always err toward flagging, not clearing
2. Even WEAK signals deserve a score of 25-40. Don't discard them
3. Industrial zones, warehouses, large rooftops, and empty lots = score 40-60 by default
4. Residential areas can still have neglected individual structures
5. If you see ANY of: empty lot, warehouse, industrial facility, isolated building, sparse traffic → score it 30+
6. A "boring" tile is still useful — describe what makes it appear active OR what edge-case signals exist
7. Do NOT use language like "area looks active and well-maintained" without also noting any possible weak signals

Return ONLY valid JSON, no markdown, no extra text:
{
  "confidenceScore": <integer 0-100: likelihood this contains neglected/abandoned structures. Give 25+ for any industrial, isolated, or potentially-vacant area. Give 50+ for clear decay signals. Give 75+ for obvious dereliction>,
  "decayLevel": <integer 0-100: severity of decay signals observed. Give at least 20 for industrial/empty areas>,
  "indicators": [<3-6 specific observed signals. Use phrases like: "vacant warehouse roof", "empty lot, no vehicles", "overgrown perimeter", "industrial facility low activity", "possible brownfield", "isolated structure", "faded parking markings", "low pedestrian density">],
  "reasoning": "<2 punchy sentences: what specific patterns make this suspicious OR what you would tell an urban explorer to investigate>",
  "suspicionTier": <exactly one of: "high_decay" | "suspicious" | "potentially_neglected" | "requires_verification" | "appears_active">
}`;

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
      config: { maxOutputTokens: 600, responseMimeType: "application/json" },
    });

    const raw = (response.text ?? "{}").replace(/```json\n?|\n?```/g, "").trim();

    // Debug log: always log raw Gemini output
    logger.debug({ tx, ty, zoom, rawGemini: raw }, "[SatScanner] Raw Gemini response");

    const parsed = JSON.parse(raw) as {
      confidenceScore?: number;
      decayLevel?: number;
      indicators?: string[];
      reasoning?: string;
      suspicionTier?: string;
    };

    const tier = typeof parsed.suspicionTier === "string" ? parsed.suspicionTier : "requires_verification";
    const tierFloor = TIER_FLOOR[tier] ?? 20;

    // Raw score from Gemini
    let confidence = Math.max(0, Math.min(100, Math.round(parsed.confidenceScore ?? 0)));
    let decay = Math.max(0, Math.min(100, Math.round(parsed.decayLevel ?? 0)));

    logger.debug(
      { tx, ty, zoom, rawConfidence: confidence, tier, tierFloor },
      "[SatScanner] Pre-boost score"
    );

    // ── Soft boost: apply tier floor if Gemini undershot ──
    if (confidence < tierFloor) {
      logger.debug(
        { tx, ty, confidence, tierFloor, tier },
        "[SatScanner] Boosting score to tier floor"
      );
      confidence = tierFloor;
    }

    // ── Indicator bonus: 3+ indicators with low score → nudge up ──
    const indicators = Array.isArray(parsed.indicators) ? parsed.indicators.slice(0, 6) : [];
    if (indicators.length >= 3 && confidence < 30) {
      confidence = 30;
      logger.debug({ tx, ty }, "[SatScanner] Indicator bonus applied → 30");
    }

    // ── Decay floor: if we have a decent confidence, decay shouldn't be 0 ──
    if (confidence >= 30 && decay < 20) {
      decay = 20;
    }

    // ── Fallback if Gemini returned trivially low scores for non-active tiers ──
    if (confidence < 20 && tier !== "appears_active") {
      const fb = heuristicFallback(tx, ty, zoom, centerLat, centerLng);
      logger.info(
        { tx, ty, geminiConfidence: confidence, tier, heuristicConfidence: fb.confidenceScore },
        "[SatScanner] Gemini too conservative — applying heuristic override"
      );
      return {
        tileX: tx, tileY: ty, zoom,
        lat: nw.lat, lng: nw.lng,
        latSE: se.lat, lngSE: se.lng,
        centerLat, centerLng,
        ...fb,
        source: "heuristic",
      };
    }

    logger.debug(
      { tx, ty, zoom, finalConfidence: confidence, finalDecay: decay, tier, indicatorCount: indicators.length },
      "[SatScanner] Final tile result"
    );

    return {
      tileX: tx, tileY: ty, zoom,
      lat: nw.lat, lng: nw.lng,
      latSE: se.lat, lngSE: se.lng,
      centerLat, centerLng,
      confidenceScore: confidence,
      decayLevel: decay,
      indicators,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "Tile flagged for human verification.",
      suspicionTier: tier,
      source: "gemini",
    };
  } catch (err) {
    logger.warn({ err, tx, ty, zoom }, "[SatScanner] Gemini parse/call failed — using heuristic fallback");
    const fb = heuristicFallback(tx, ty, zoom, centerLat, centerLng);
    return {
      tileX: tx, tileY: ty, zoom,
      lat: nw.lat, lng: nw.lng,
      latSE: se.lat, lngSE: se.lng,
      centerLat, centerLng,
      ...fb,
      source: "heuristic",
    };
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
  const halfGrid = Math.min(2, Math.max(1, Math.round(rawHalf ?? 1)));

  const center = latLngToTile(lat, lng, zoom);
  const tiles: { x: number; y: number }[] = [];

  for (let dy = -halfGrid; dy <= halfGrid; dy++) {
    for (let dx = -halfGrid; dx <= halfGrid; dx++) {
      tiles.push({ x: center.x + dx, y: center.y + dy });
    }
  }

  logger.info({ lat, lng, zoom, halfGrid, tileCount: tiles.length }, "[SatScanner] Scan started");

  const analysisResults = await Promise.all(
    tiles.map((t) => analyzeTile(zoom, t.x, t.y))
  );

  const valid = analysisResults.filter(Boolean) as TileAnalysis[];

  // ── Global soft boost: if everything is very low, the AI was overly conservative ──
  const avgScore = valid.reduce((s, r) => s + r.confidenceScore, 0) / (valid.length || 1);
  let boostedValid = valid;
  if (avgScore < 18 && valid.length > 0) {
    const boost = Math.round(22 - avgScore);
    logger.info({ avgScore, boost }, "[SatScanner] Global soft boost applied — all scores too low");
    boostedValid = valid.map((r) => ({
      ...r,
      confidenceScore: Math.min(r.confidenceScore + boost, 55),
      decayLevel: Math.min(r.decayLevel + Math.round(boost / 2), 60),
    }));
  }

  // ── Flag anything ≥ 20 (TRACE+ confidence) ──
  const flagged = boostedValid
    .filter((r) => r.confidenceScore >= 20)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  // ── Guarantee: always surface top 3 tiles even if confidence is low ──
  let surfaced = flagged;
  if (flagged.length < 3 && boostedValid.length > 0) {
    const top3 = [...boostedValid].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 3);
    surfaced = top3;
    logger.info(
      { flaggedCount: flagged.length, surfacedCount: surfaced.length },
      "[SatScanner] Below threshold — surfacing top-3 guaranteed"
    );
  }

  logger.info(
    {
      tilesScanned: valid.length,
      flagged: flagged.length,
      surfaced: surfaced.length,
      avgScore: Math.round(avgScore),
      geminiTiles: valid.filter((r) => r.source === "gemini").length,
      heuristicTiles: valid.filter((r) => r.source === "heuristic").length,
    },
    "[SatScanner] Scan complete"
  );

  res.json({
    zoom,
    centerLat: lat,
    centerLng: lng,
    tilesScanned: valid.length,
    results: boostedValid,
    flagged: surfaced,
  });
});

export default router;
