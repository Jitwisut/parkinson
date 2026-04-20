const { z } = require("zod");

const medicationSchema = z.object({
  name: z.string().min(1),
  doseMg: z.number().positive().optional().nullable(),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  active: z.boolean().default(true),
});

const medicationLogSchema = z.object({
  status: z.enum(["TAKEN", "SKIPPED", "MISSED"]),
  scheduledAt: z.coerce.date(),
  takenAt: z.coerce.date().optional().nullable(),
});

module.exports = { medicationSchema, medicationLogSchema };
