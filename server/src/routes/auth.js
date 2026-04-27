const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { registerUser, loginUser } = require("../services/authService");
const { registerSchema, loginSchema } = require("../validators/auth");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload.email, payload.password);
    res.json(result);
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);
    res.status(201).json(result);
  })
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      message: "Signed out successfully",
    });
  })
);

module.exports = router;
