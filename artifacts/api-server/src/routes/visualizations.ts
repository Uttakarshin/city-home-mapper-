import { Router } from "express";
import { db } from "@workspace/db";
import { visualizationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GenerateVisualizationBody, GetVisualizationParams } from "@workspace/api-zod";

const router = Router();

const UNSPLASH_BASE = "https://images.unsplash.com/photo-";
const Q = "?auto=format&fit=crop&w=900&q=85";

const HOUSE_IMAGES: Record<string, string[]> = {
  Modern: [
    `${UNSPLASH_BASE}1600596542815-ffad4c1539a9${Q}`,
    `${UNSPLASH_BASE}1600585154340-be6161a56a0c${Q}`,
    `${UNSPLASH_BASE}1564013799919-ab600027ffc6${Q}`,
    `${UNSPLASH_BASE}1583608205776-bfd35f0d9f83${Q}`,
    `${UNSPLASH_BASE}1600047509807-ba8f99d2cdde${Q}`,
    `${UNSPLASH_BASE}1600607687920-4e2a09cf159d${Q}`,
  ],
  Contemporary: [
    `${UNSPLASH_BASE}1600566753086-00f18fb6b3ea${Q}`,
    `${UNSPLASH_BASE}1605276374104-dee2a0ed3cd6${Q}`,
    `${UNSPLASH_BASE}1512917774080-9991f1c4c750${Q}`,
    `${UNSPLASH_BASE}1600596542815-ffad4c1539a9${Q}`,
    `${UNSPLASH_BASE}1600585154340-be6161a56a0c${Q}`,
  ],
  Colonial: [
    `${UNSPLASH_BASE}1568605114967-8130f3a36994${Q}`,
    `${UNSPLASH_BASE}1570129477492-45c003edd2be${Q}`,
    `${UNSPLASH_BASE}1512917774080-9991f1c4c750${Q}`,
    `${UNSPLASH_BASE}1558036117-56df72e659c4${Q}`,
    `${UNSPLASH_BASE}1523217582562-09d0def993a6${Q}`,
  ],
  Mediterranean: [
    `${UNSPLASH_BASE}1577495508048-b635879837f1${Q}`,
    `${UNSPLASH_BASE}1523217582562-09d0def993a6${Q}`,
    `${UNSPLASH_BASE}1499793983690-e29da59ef1c2${Q}`,
    `${UNSPLASH_BASE}1564501049412-61d2ad2d6cf2${Q}`,
    `${UNSPLASH_BASE}1600596542815-ffad4c1539a9${Q}`,
  ],
  Victorian: [
    `${UNSPLASH_BASE}1558618666-fcd25c85cd64${Q}`,
    `${UNSPLASH_BASE}1568605114967-8130f3a36994${Q}`,
    `${UNSPLASH_BASE}1570129477492-45c003edd2be${Q}`,
    `${UNSPLASH_BASE}1512917774080-9991f1c4c750${Q}`,
  ],
  Minimalist: [
    `${UNSPLASH_BASE}1600210492493-0946041159a3${Q}`,
    `${UNSPLASH_BASE}1600566753086-00f18fb6b3ea${Q}`,
    `${UNSPLASH_BASE}1600585154340-be6161a56a0c${Q}`,
    `${UNSPLASH_BASE}1605276374104-dee2a0ed3cd6${Q}`,
    `${UNSPLASH_BASE}1583608205776-bfd35f0d9f83${Q}`,
  ],
  Craftsman: [
    `${UNSPLASH_BASE}1575517111839-3a3843ee7f5d${Q}`,
    `${UNSPLASH_BASE}1568605114967-8130f3a36994${Q}`,
    `${UNSPLASH_BASE}1558036117-56df72e659c4${Q}`,
    `${UNSPLASH_BASE}1570129477492-45c003edd2be${Q}`,
  ],
  "Art Deco": [
    `${UNSPLASH_BASE}1513694203232-719a899d4631${Q}`,
    `${UNSPLASH_BASE}1600566753086-00f18fb6b3ea${Q}`,
    `${UNSPLASH_BASE}1564013799919-ab600027ffc6${Q}`,
  ],
  Waterfront: [
    `${UNSPLASH_BASE}1505916349660-8621ece2bf6f${Q}`,
    `${UNSPLASH_BASE}1499793983690-e29da59ef1c2${Q}`,
    `${UNSPLASH_BASE}1416339442236-8ceb164046f8${Q}`,
  ],
  Mountain: [
    `${UNSPLASH_BASE}1518780664697-55e3ad937233${Q}`,
    `${UNSPLASH_BASE}1501854140801-50d01698950b${Q}`,
    `${UNSPLASH_BASE}1564501049412-61d2ad2d6cf2${Q}`,
  ],
  Countryside: [
    `${UNSPLASH_BASE}1564501049412-61d2ad2d6cf2${Q}`,
    `${UNSPLASH_BASE}1500382017468-9049fed747ef${Q}`,
    `${UNSPLASH_BASE}1558036117-56df72e659c4${Q}`,
  ],
  Garden: [
    `${UNSPLASH_BASE}1558618047-3b5be5fdb4c2${Q}`,
    `${UNSPLASH_BASE}1416339442236-8ceb164046f8${Q}`,
    `${UNSPLASH_BASE}1575517111839-3a3843ee7f5d${Q}`,
  ],
  default: [
    `${UNSPLASH_BASE}1600596542815-ffad4c1539a9${Q}`,
    `${UNSPLASH_BASE}1568605114967-8130f3a36994${Q}`,
    `${UNSPLASH_BASE}1570129477492-45c003edd2be${Q}`,
    `${UNSPLASH_BASE}1564013799919-ab600027ffc6${Q}`,
    `${UNSPLASH_BASE}1583608205776-bfd35f0d9f83${Q}`,
    `${UNSPLASH_BASE}1600585154340-be6161a56a0c${Q}`,
  ],
};

function pickImages(params: {
  style?: string | null;
  surroundings?: string | null;
  bedrooms?: number | null;
}): string[] {
  const pool: string[] = [];

  if (params.style && HOUSE_IMAGES[params.style]) {
    pool.push(...HOUSE_IMAGES[params.style]);
  }

  const surroundingKey = params.surroundings?.toLowerCase();
  if (surroundingKey?.includes("waterfront") || surroundingKey?.includes("water")) {
    pool.push(...HOUSE_IMAGES["Waterfront"]);
  } else if (surroundingKey?.includes("mountain")) {
    pool.push(...HOUSE_IMAGES["Mountain"]);
  } else if (surroundingKey?.includes("countryside") || surroundingKey?.includes("country")) {
    pool.push(...HOUSE_IMAGES["Countryside"]);
  } else if (surroundingKey?.includes("garden")) {
    pool.push(...HOUSE_IMAGES["Garden"]);
  }

  if (pool.length === 0) {
    pool.push(...HOUSE_IMAGES["default"]);
  }

  const unique = [...new Set(pool)];
  const shuffled = unique.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

// POST /api/visualizations
router.post("/visualizations", async (req, res) => {
  try {
    const parse = GenerateVisualizationBody.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const d = parse.data;
    const images = pickImages({
      style: d.style ?? null,
      surroundings: d.surroundings ?? null,
      bedrooms: d.bedrooms ?? null,
    });

    // Store JSON array of image URLs in the imageBase64 column
    const imageBase64 = JSON.stringify(images);

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
