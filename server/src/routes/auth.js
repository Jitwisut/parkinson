const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { registerUser, verifyTokenAndResolveProfile } = require("../services/authService");
const { registerSchema, verifyAuthSchema } = require("../validators/auth");

const router = express.Router();

router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const payload = verifyAuthSchema.parse(req.body);
    const result = await verifyTokenAndResolveProfile(payload.idToken);
    res.json(result);
  })
);

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const user = await registerUser(payload);
    res.status(201).json(user);
  })
);

module.exports = router;
