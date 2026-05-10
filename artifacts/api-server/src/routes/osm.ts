import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function normalizeName(tags: Record<string, string>): string {
  return (
    tags["name"] ??
    tags["abandoned:name"] ??
    tags["disused:name"] ??
    tags["old_name"] ??
    "Unnamed Site"
  );
}

function inferCategory(tags: Record<string, string>): string {
  const combined = Object.values(tags).join(" ").toLowerCase() + Object.keys(tags).join(" ").toLowerCase();
  if (combined.includes("hospital") || combined.includes("clinic") || combined.includes("health")) return "hospital";
  if (combined.includes("mall") || combined.includes("retail") || combined.includes("shop") || combined.includes("supermarket")) return "mall";
  if (combined.includes("school") || combined.includes("college") || combined.includes("university") || combined.includes("education")) return "school";
  if (combined.includes("tunnel") || combined.includes("mine") || combined.includes("bunker")) return "tunnel";
  if (combined.includes("factory") || combined.includes("industrial") || combined.includes("warehouse") || combined.includes("power")) return "factory";
  return "industrial";
}

function inferRisk(tags: Record<string, string>): string {
  const hazards = ["asbestos", "contaminated", "hazmat", "toxic", "unstable", "collapse"];
  const combined = Object.values(tags).join(" ").toLowerCase();
  if (hazards.some((h) => combined.includes(h))) return "extreme";
  const startDate = tags["start_date"] ?? tags["abandoned:start_date"] ?? "";
  if (startDate && parseInt(startDate) < 1980) return "high";
  if (startDate && parseInt(startDate) < 2000) return "medium";
  return "medium";
}

function inferAbandonmentScore(tags: Record<string, string>): number {
  let score = 50;
  if (tags["ruins"] === "yes") score += 25;
  if (tags["abandoned"] === "yes" || tags["disused"] === "yes") score += 10;
  const startDate = tags["start_date"] ?? tags["abandoned:start_date"] ?? "";
  if (startDate) {
    const age = new Date().getFullYear() - parseInt(startDate);
    if (age > 30) score += 20;
    else if (age > 15) score += 12;
    else if (age > 5) score += 5;
  }
  return Math.min(99, score);
}

router.get("/admin/osm", async (req, res) => {
  try {
    const { south, west, north, east } = req.query as Record<string, string>;
    if (!south || !west || !north || !east) {
      return res.status(400).json({ error: "Missing bbox params: south, west, north, east" });
    }

    const bbox = `${south},${west},${north},${east}`;
    const query = `
      [out:json][timeout:25];
      (
        node["abandoned"](${bbox});
        way["abandoned"](${bbox});
        node["ruins"="yes"](${bbox});
        way["ruins"="yes"](${bbox});
        node["disused:amenity"](${bbox});
        way["disused:amenity"](${bbox});
        node["disused:landuse"](${bbox});
        way["disused:landuse"](${bbox});
        node["historic"="ruins"](${bbox});
        way["historic"="ruins"](${bbox});
      );
      out center 80;
    `.trim();

    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      return res.status(502).json({ error: "Overpass API error", status: resp.status });
    }

    const json = await resp.json() as { elements: OSMElement[] };
    const elements = json.elements ?? [];

    const locations = elements
      .map((el) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) return null;
        const tags = el.tags ?? {};
        return {
          osmId: `osm-${el.type}-${el.id}`,
          name: normalizeName(tags),
          category: inferCategory(tags),
          latitude: lat,
          longitude: lon,
          description: [
            tags["description"],
            tags["note"],
            tags["abandoned:name"] ? `Formerly: ${tags["abandoned:name"]}` : null,
            tags["disused:amenity"] ? `Disused ${tags["disused:amenity"]}` : null,
          ].filter(Boolean).join(" · ") || `Abandoned ${inferCategory(tags)} found via OpenStreetMap.`,
          riskLevel: inferRisk(tags),
          abandonmentScore: inferAbandonmentScore(tags),
          closureDate: tags["abandoned:start_date"] ?? tags["start_date"] ?? null,
          buildingStatus: tags["ruins"] === "yes" ? "partial" : "unknown",
          sourceType: "osm",
          sourceAttribution: `OpenStreetMap contributors — osm.org/node/${el.id}`,
          verificationState: "community_verified",
          tags,
        };
      })
      .filter(Boolean);

    logger.info({ count: locations.length, bbox }, "OSM locations fetched");
    return res.json({ locations, count: locations.length });
  } catch (err) {
    logger.error({ err }, "OSM fetch failed");
    return res.status(500).json({ error: "Failed to fetch from OpenStreetMap" });
  }
});

export default router;
