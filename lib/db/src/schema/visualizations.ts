import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visualizationsTable = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  style: text("style"),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms", { precision: 3, scale: 1 }),
  stories: integer("stories"),
  exteriorColor: text("exterior_color"),
  surroundings: text("surroundings"),
  imageBase64: text("image_base64").notNull(),
  propertyId: integer("property_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVisualizationSchema = createInsertSchema(visualizationsTable).omit({ id: true, createdAt: true });
export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = typeof visualizationsTable.$inferSelect;
