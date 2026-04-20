const { z } = require("zod");

const resolveAlertSchema = z.object({
  resolved: z.boolean().default(true),
});

module.exports = { resolveAlertSchema };
