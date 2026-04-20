const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requirePatientId } = require("../utils/requestContext");
const { requirePatientAccess } = require("../middleware/authorization");
const {
  createTremorReading,
  getBaseline,
  syncStepEntry,
  upsertBaseline,
} = require("../services/sensorService");
const { baselineSchema, stepSchema, tremorSchema } = require("../validators/sensor");

const router = express.Router();

router.use(requireAuth);
router.use(requirePatientAccess);

router.post(
  "/tremor",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = tremorSchema.parse(req.body);
    const reading = await createTremorReading(patientId, payload);
    res.status(201).json(reading);
  })
);

router.get(
  "/tremor/baseline",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const baseline = await getBaseline(patientId);
    res.json(baseline);
  })
);

router.post(
  "/tremor/baseline",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = baselineSchema.parse(req.body);
    const baseline = await upsertBaseline(patientId, payload.rmsBaseline);
    res.status(201).json(baseline);
  })
);

router.post(
  "/steps",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = stepSchema.parse(req.body);
    const item = await syncStepEntry(patientId, payload);
    res.status(201).json(item);
  })
);

module.exports = router;
