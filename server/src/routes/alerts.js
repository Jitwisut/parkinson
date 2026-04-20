const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requirePatientId } = require("../utils/requestContext");
const { requirePatientAccess } = require("../middleware/authorization");
const { listAlerts, listAlertHistory, resolveAlert } = require("../services/alertService");
const { resolveAlertSchema } = require("../validators/alerts");

const router = express.Router();

router.use(requireAuth);
router.use(requirePatientAccess);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const items = await listAlerts(patientId);
    res.json(items);
  })
);

router.post(
  "/:id/resolve",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = resolveAlertSchema.parse(req.body);
    const alert = await resolveAlert(patientId, req.params.id, payload.resolved);
    res.json(alert);
  })
);

router.get(
  "/history",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const items = await listAlertHistory(patientId);
    res.json(items);
  })
);

module.exports = router;
