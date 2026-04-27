const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["PATIENT", "CAREGIVER", "DOCTOR"]).default("PATIENT"),
  fcmToken: z.string().optional().nullable(),
});

module.exports = { loginSchema, registerSchema };
