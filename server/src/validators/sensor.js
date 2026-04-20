const { z } = require("zod");

const tremorSchema = z.object({
  ax: z.number(),
  ay: z.number(),
  az: z.number(),
  rms: z.number().nonnegative(),
  recordedAt: z.coerce.date().optional(),
});

const baselineSchema = z.object({
  rmsBaseline: z.number().positive(),
});

const stepSchema = z.object({
  stepCount: z.number().int().nonnegative(),
  entryDate: z.coerce.date(),
});

module.exports = { tremorSchema, baselineSchema, stepSchema };
