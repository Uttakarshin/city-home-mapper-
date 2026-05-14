import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, favoritesTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  GetPropertyParams,
  UpdatePropertyParams,
  UpdatePropertyBody,
  DeletePropertyParams,
} from "@workspace/api-zod";

const router = Router();

// GET /api/properties/stats
router.get("/properties/stats", async (req, res) => {
  try {
    const rows = await db.select().from(propertiesTable);
    const total = rows.length;
    const avgPrice = total > 0 ? rows.reduce((s, r) => s + Number(r.price), 0) / total : 0;
    const avgSqft  = total > 0 ? rows.reduce((s, r) => s + r.sqft, 0) / total : 0;

    // City breakdown
    const cityMap = new Map<string, { count: number; total: number }>();
    for (const r of rows) {
      const cur = cityMap.get(r.city) ?? { count: 0, total: 0 };
      cityMap.set(r.city, { count: cur.count + 1, total: cur.total + Number(r.price) });
    }
    const cityBreakdown = [...cityMap.entries()].map(([city, { count, total }]) => ({
      city,
      count,
      avgPrice: Math.round(total / count),
    }));

    // Type breakdown
    const typeMap = new Map<string, number>();
    for (const r of rows) typeMap.set(r.propertyType, (typeMap.get(r.propertyType) ?? 0) + 1);
    const typeBreakdown = [...typeMap.entries()].map(([type, count]) => ({ type, count }));

    // Price ranges
    const ranges = [
      { label: "Under ₹50L",       min: 0,          max: 50_00_000   },
      { label: "₹50L – ₹1Cr",      min: 50_00_000,  max: 1_00_00_000 },
      { label: "₹1Cr – ₹2Cr",      min: 1_00_00_000,max: 2_00_00_000 },
      { label: "Above ₹2Cr",        min: 2_00_00_000,max: Infinity    },
    ];
    const priceRanges = ranges.map(({ label, min, max }) => ({
      range: label,
      count: rows.filter((r) => Number(r.price) >= min && Number(r.price) < max).length,
    }));

    res.json({ totalListings: total, avgPrice, avgSqft, cityBreakdown, typeBreakdown, priceRanges });
  } catch (err) {
    req.log.error({ err }, "getPropertyStats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties/featured
router.get("/properties/featured", async (req, res) => {
  try {
    const rows = await db.select().from(propertiesTable).where(eq(propertiesTable.isFeatured, true));
    const favs = await db.select().from(favoritesTable);
    const favSet = new Set(favs.map((f) => f.propertyId));
    res.json(rows.map((r) => ({ ...r, price: Number(r.price), lat: Number(r.lat), lng: Number(r.lng), bathrooms: Number(r.bathrooms), isFavorited: favSet.has(r.id) })));
  } catch (err) {
    req.log.error({ err }, "getFeaturedProperties failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties
router.get("/properties", async (req, res) => {
  try {
    const parse = ListPropertiesQueryParams.safeParse(req.query);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const q = parse.data;
    let rows = await db.select().from(propertiesTable);

    if (q.city)           rows = rows.filter((r) => r.city.toLowerCase().includes(String(q.city).toLowerCase()));
    if (q.minPrice)       rows = rows.filter((r) => Number(r.price) >= Number(q.minPrice));
    if (q.maxPrice)       rows = rows.filter((r) => Number(r.price) <= Number(q.maxPrice));
    if (q.bedrooms)       rows = rows.filter((r) => r.bedrooms >= Number(q.bedrooms));
    if (q.bathrooms)      rows = rows.filter((r) => Number(r.bathrooms) >= Number(q.bathrooms));
    if (q.propertyType)   rows = rows.filter((r) => r.propertyType === q.propertyType);

    // Geo filter
    if (q.lat && q.lng && q.radiusKm) {
      const lat = Number(q.lat), lng = Number(q.lng), radius = Number(q.radiusKm);
      rows = rows.filter((r) => {
        const dlat = (Number(r.lat) - lat) * (Math.PI / 180);
        const dlng = (Number(r.lng) - lng) * (Math.PI / 180);
        const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(Number(r.lat) * Math.PI / 180) * Math.sin(dlng / 2) ** 2;
        const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return dist <= radius;
      });
    }

    const favs = await db.select().from(favoritesTable);
    const favSet = new Set(favs.map((f) => f.propertyId));
    res.json(rows.map((r) => ({ ...r, price: Number(r.price), lat: Number(r.lat), lng: Number(r.lng), bathrooms: Number(r.bathrooms), isFavorited: favSet.has(r.id) })));
  } catch (err) {
    req.log.error({ err }, "listProperties failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/properties
router.post("/properties", async (req, res) => {
  try {
    const parse = CreatePropertyBody.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const d = parse.data;
    const [row] = await db.insert(propertiesTable).values({
      title:        d.title,
      description:  d.description ?? null,
      price:        String(d.price),
      address:      d.address,
      city:         d.city,
      state:        d.state,
      zipCode:      d.zipCode ?? null,
      bedrooms:     d.bedrooms,
      bathrooms:    String(d.bathrooms),
      sqft:         d.sqft,
      propertyType: d.propertyType,
      yearBuilt:    d.yearBuilt ?? null,
      lat:          String(d.lat),
      lng:          String(d.lng),
      imageUrl:     d.imageUrl ?? null,
      isFeatured:   d.isFeatured ?? false,
    }).returning();
    res.status(201).json({ ...row, price: Number(row.price), lat: Number(row.lat), lng: Number(row.lng), bathrooms: Number(row.bathrooms), isFavorited: false });
  } catch (err) {
    req.log.error({ err }, "createProperty failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/properties/:id
router.get("/properties/:id", async (req, res) => {
  try {
    const parse = GetPropertyParams.safeParse({ id: Number(req.params.id) });
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const [row] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, parse.data.id));
    if (!row) return res.status(404).json({ error: "Property not found" });

    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.propertyId, row.id));
    res.json({ ...row, price: Number(row.price), lat: Number(row.lat), lng: Number(row.lng), bathrooms: Number(row.bathrooms), isFavorited: favs.length > 0 });
  } catch (err) {
    req.log.error({ err }, "getProperty failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/properties/:id
router.patch("/properties/:id", async (req, res) => {
  try {
    const paramsParse = UpdatePropertyParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParse.success) return res.status(400).json({ error: paramsParse.error.flatten() });

    const bodyParse = UpdatePropertyBody.safeParse(req.body);
    if (!bodyParse.success) return res.status(400).json({ error: bodyParse.error.flatten() });

    const d = bodyParse.data;
    const updates: Partial<typeof propertiesTable.$inferInsert> = {};
    if (d.title        !== undefined) updates.title        = d.title;
    if (d.description  !== undefined) updates.description  = d.description;
    if (d.price        !== undefined) updates.price        = String(d.price);
    if (d.address      !== undefined) updates.address      = d.address;
    if (d.city         !== undefined) updates.city         = d.city;
    if (d.state        !== undefined) updates.state        = d.state;
    if (d.zipCode      !== undefined) updates.zipCode      = d.zipCode;
    if (d.bedrooms     !== undefined) updates.bedrooms     = d.bedrooms;
    if (d.bathrooms    !== undefined) updates.bathrooms    = String(d.bathrooms);
    if (d.sqft         !== undefined) updates.sqft         = d.sqft;
    if (d.propertyType !== undefined) updates.propertyType = d.propertyType;
    if (d.yearBuilt    !== undefined) updates.yearBuilt    = d.yearBuilt;
    if (d.lat          !== undefined) updates.lat          = String(d.lat);
    if (d.lng          !== undefined) updates.lng          = String(d.lng);
    if (d.imageUrl     !== undefined) updates.imageUrl     = d.imageUrl;
    if (d.isFeatured   !== undefined) updates.isFeatured   = d.isFeatured;

    const [row] = await db.update(propertiesTable).set(updates).where(eq(propertiesTable.id, paramsParse.data.id)).returning();
    if (!row) return res.status(404).json({ error: "Property not found" });

    const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.propertyId, row.id));
    res.json({ ...row, price: Number(row.price), lat: Number(row.lat), lng: Number(row.lng), bathrooms: Number(row.bathrooms), isFavorited: favs.length > 0 });
  } catch (err) {
    req.log.error({ err }, "updateProperty failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/properties/:id
router.delete("/properties/:id", async (req, res) => {
  try {
    const parse = DeletePropertyParams.safeParse({ id: Number(req.params.id) });
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    await db.delete(propertiesTable).where(eq(propertiesTable.id, parse.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteProperty failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
