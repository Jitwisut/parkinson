const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireCaregiverId } = require("../utils/requestContext");
const { getPatientStatus, listPatientsForCaregiver } = require("../services/caregiverService");
const { requireRole, requirePatientAccess } = require("../middleware/authorization");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("CAREGIVER", "DOCTOR"));

router.get(
  "/patients",
  asyncHandler(async (req, res) => {
    const caregiverId = requireCaregiverId(req);
    const items = await listPatientsForCaregiver(caregiverId);
    res.json(items);
  })
);

router.get(
  "/patients/:id/status",
  requirePatientAccess,
  asyncHandler(async (req, res) => {
    const status = await getPatientStatus(req.params.id);
    res.json(status);
  })
);

module.exports = router;
