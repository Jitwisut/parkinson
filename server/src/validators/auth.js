const { z } = require("zod");

const verifyAuthSchema = z.object({
  idToken: z.string().min(1),
});

const registerSchema = z.object({
  firebaseUid: z.string().optional().nullable(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["PATIENT", "CAREGIVER", "DOCTOR"]).default("PATIENT"),
  fcmToken: z.string().optional().nullable(),
});

module.exports = { verifyAuthSchema, registerSchema };
