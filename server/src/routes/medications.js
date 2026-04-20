const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requirePatientId } = require("../utils/requestContext");
const { requirePatientAccess } = require("../middleware/authorization");
const {
  createMedication,
  createMedicationLog,
  deleteMedication,
  getMedicationCompliance,
  listMedicationLogs,
  listMedications,
  updateMedication,
} = require("../services/medicationService");
const { medicationLogSchema, medicationSchema } = require("../validators/medications");

const router = express.Router();

router.use(requireAuth);
router.use(requirePatientAccess);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const items = await listMedications(patientId);
    res.json(items);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = medicationSchema.parse(req.body);
    const item = await createMedication(patientId, payload);
    res.status(201).json(item);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = medicationSchema.parse(req.body);
    const item = await updateMedication(patientId, req.params.id, payload);
    res.json(item);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    await deleteMedication(patientId, req.params.id);
    res.status(204).send();
  })
);

router.post(
  "/:id/log",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = medicationLogSchema.parse(req.body);
    const item = await createMedicationLog(patientId, req.params.id, payload);
    res.status(201).json(item);
  })
);

router.get(
  "/logs",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const logs = await listMedicationLogs(patientId);
    res.json(logs);
  })
);

router.get(
  "/compliance",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const compliance = await getMedicationCompliance(patientId);
    res.json(compliance);
  })
);

module.exports = router;
