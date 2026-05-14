import { Router } from "express";
import { db } from "@workspace/db";
import { propertiesTable, favoritesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AddFavoriteParams, RemoveFavoriteParams } from "@workspace/api-zod";

const router = Router();

// GET /api/favorites — returns full property objects for all favorited properties
router.get("/favorites", async (req, res) => {
  try {
    const favs = await db.select().from(favoritesTable);
    if (favs.length === 0) return res.json([]);

    const props = await db.select().from(propertiesTable);
    const propMap = new Map(props.map((p) => [p.id, p]));

    const result = favs
      .map((f) => {
        const p = propMap.get(f.propertyId);
        if (!p) return null;
        return { ...p, price: Number(p.price), lat: Number(p.lat), lng: Number(p.lng), bathrooms: Number(p.bathrooms), isFavorited: true };
      })
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "listFavorites failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/favorites/:propertyId
router.post("/favorites/:propertyId", async (req, res) => {
  try {
    const parse = AddFavoriteParams.safeParse({ propertyId: Number(req.params.propertyId) });
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { propertyId } = parse.data;

    // Check property exists
    const [prop] = await db.select().from(propertiesTable).where(eq(propertiesTable.id, propertyId));
    if (!prop) return res.status(404).json({ error: "Property not found" });

    // Upsert — ignore if already favorited
    const existing = await db.select().from(favoritesTable).where(eq(favoritesTable.propertyId, propertyId));
    if (existing.length > 0) return res.status(201).json(existing[0]);

    const [fav] = await db.insert(favoritesTable).values({ propertyId }).returning();
    res.status(201).json(fav);
  } catch (err) {
    req.log.error({ err }, "addFavorite failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/favorites/:propertyId
router.delete("/favorites/:propertyId", async (req, res) => {
  try {
    const parse = RemoveFavoriteParams.safeParse({ propertyId: Number(req.params.propertyId) });
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    await db.delete(favoritesTable).where(eq(favoritesTable.propertyId, parse.data.propertyId));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "removeFavorite failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
