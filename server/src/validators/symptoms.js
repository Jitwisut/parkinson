const { z } = require("zod");

const symptomSchema = z.object({
  tremorLevel: z.number().int().min(0).max(5),
  rigidityLevel: z.number().int().min(0).max(5),
  walkingDifficulty: z.boolean().default(false),
  freezingGait: z.boolean().default(false),
  mood: z.number().int().min(0).max(5),
  energyLevel: z.number().int().min(0).max(5),
  note: z.string().max(1000).optional().nullable(),
  source: z.enum(["manual", "sensor"]).default("manual"),
  recordedAt: z.coerce.date().optional(),
});

const bulkSymptomSchema = z.object({
  items: z.array(symptomSchema).min(1),
});

const symptomQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

const summaryQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
});

module.exports = {
  symptomSchema,
  bulkSymptomSchema,
  symptomQuerySchema,
  summaryQuerySchema,
};
