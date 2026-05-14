import { Router } from "express";
import { db } from "@workspace/db";
import { visualizationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateVisualizationBody, GetVisualizationParams } from "@workspace/api-zod";

const router = Router();

/**
 * Generates a simple SVG house image encoded as a base64 data URL.
 * This serves as a placeholder when no AI service is configured.
 */
function generateHouseSvg(params: {
  prompt: string;
  style?: string | null;
  bedrooms?: number | null;
  exteriorColor?: string | null;
  surroundings?: string | null;
}): string {
  const COLOR_MAP: Record<string, string> = {
    White: "#f5f0ea", Beige: "#e8dcc8", Grey: "#c8c4bc", Blue: "#a8c4e0",
    Green: "#a8d0a8", Terracotta: "#d4886a", Cream: "#f2e8d0", Sand: "#d8c898",
  };
  const wallColor  = COLOR_MAP[params.exteriorColor ?? ""] ?? "#e8dcc8";
  const roofColor  = "#6b5545";
  const beds       = params.bedrooms ?? 3;
  const windowCount = Math.min(8, Math.max(2, beds + 1));

  const W = 400, H = 300;
  const houseW = 220, houseH = 110;
  const houseX = (W - houseW) / 2;
  const groundY = H - 60;
  const eaveY   = groundY - houseH;
  const ridgeY  = eaveY - 70;
  const ridgeX  = houseX + houseW / 2;
  const doorW = 30, doorH = 55;
  const doorX = ridgeX - doorW / 2;
  const doorY = groundY - doorH;

  const windowSvgs: string[] = [];
  const winSize = 22;
  const winY = eaveY + 20;
  const spacing = houseW / (windowCount + 1);
  for (let i = 0; i < windowCount; i++) {
    const wx = houseX + spacing * (i + 1) - winSize / 2;
    if (wx > doorX - winSize - 2 && wx < doorX + doorW + 2) continue;
    windowSvgs.push(`
      <rect x="${wx}" y="${winY}" width="${winSize}" height="${winSize}" fill="#bfdbfe" stroke="#6b5545" stroke-width="1.5" rx="1"/>
      <line x1="${wx + winSize/2}" y1="${winY}" x2="${wx + winSize/2}" y2="${winY + winSize}" stroke="#6b5545" stroke-width="1"/>
      <line x1="${wx}" y1="${winY + winSize/2}" x2="${wx + winSize}" y2="${winY + winSize/2}" stroke="#6b5545" stroke-width="1"/>
    `);
  }

  const styleLabel = params.style ? `${params.style} Style` : "Dream Home";
  const bedsLabel  = beds ? `${beds} Bedroom` : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="100%" stop-color="#fef3c7"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${groundY}" fill="url(#sky)"/>
    <rect y="${groundY}" width="${W}" height="${H - groundY}" fill="#86c556"/>
    <circle cx="${W - 50}" cy="45" r="22" fill="#fbbf24" opacity="0.85"/>
    <polygon points="${houseX},${eaveY} ${houseX + houseW},${eaveY} ${ridgeX},${ridgeY}" fill="${roofColor}" stroke="#3a2518" stroke-width="2"/>
    <rect x="${houseX}" y="${eaveY}" width="${houseW}" height="${houseH}" fill="${wallColor}" stroke="#c9b8a4" stroke-width="1.5"/>
    ${windowSvgs.join("")}
    <rect x="${doorX}" y="${doorY}" width="${doorW}" height="${doorH}" fill="#7c5c4a" stroke="#5a3e2b" stroke-width="1.5" rx="2"/>
    <circle cx="${doorX + doorW * 0.75}" cy="${doorY + doorH * 0.55}" r="3" fill="#f59e0b"/>
    <text x="${W/2}" y="${H - 18}" text-anchor="middle" font-size="11" font-weight="600" fill="#6b5545" font-family="Georgia,serif">${styleLabel}${bedsLabel ? " · " + bedsLabel : ""}</text>
    <text x="${W/2}" y="${H - 5}" text-anchor="middle" font-size="9" fill="#9a8070" font-family="sans-serif">${params.prompt.slice(0, 60)}${params.prompt.length > 60 ? "…" : ""}</text>
  </svg>`;

  return Buffer.from(svg).toString("base64");
}

// POST /api/visualizations
router.post("/visualizations", async (req, res) => {
  try {
    const parse = GenerateVisualizationBody.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const d = parse.data;
    const svgBase64 = generateHouseSvg({
      prompt:        d.prompt,
      style:         d.style ?? null,
      bedrooms:      d.bedrooms ?? null,
      exteriorColor: d.exteriorColor ?? null,
      surroundings:  d.surroundings ?? null,
    });
    // Store full data URL so the frontend can use it directly as <img src>
    const imageBase64 = `data:image/svg+xml;base64,${svgBase64}`;

    const [row] = await db.insert(visualizationsTable).values({
      prompt:        d.prompt,
      style:         d.style ?? null,
      bedrooms:      d.bedrooms ?? null,
      bathrooms:     d.bathrooms !== undefined && d.bathrooms !== null ? String(d.bathrooms) : null,
      stories:       d.stories ?? null,
      exteriorColor: d.exteriorColor ?? null,
      surroundings:  d.surroundings ?? null,
      imageBase64,
      propertyId:    d.propertyId ?? null,
    }).returning();

    res.status(201).json({
      ...row,
      bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null,
    });
  } catch (err) {
    req.log.error({ err }, "generateVisualization failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/visualizations
router.get("/visualizations", async (req, res) => {
  try {
    const rows = await db.select().from(visualizationsTable).orderBy(visualizationsTable.createdAt);
    res.json(rows.map((r) => ({ ...r, bathrooms: r.bathrooms !== null ? Number(r.bathrooms) : null })));
  } catch (err) {
    req.log.error({ err }, "listVisualizations failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/visualizations/:id
router.get("/visualizations/:id", async (req, res) => {
  try {
    const parse = GetVisualizationParams.safeParse({ id: Number(req.params.id) });
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const [row] = await db.select().from(visualizationsTable).where(eq(visualizationsTable.id, parse.data.id));
    if (!row) return res.status(404).json({ error: "Visualization not found" });
    res.json({ ...row, bathrooms: row.bathrooms !== null ? Number(row.bathrooms) : null });
  } catch (err) {
    req.log.error({ err }, "getVisualization failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
