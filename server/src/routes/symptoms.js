const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requirePatientId } = require("../utils/requestContext");
const { requirePatientAccess } = require("../middleware/authorization");
const {
  bulkCreateSymptoms,
  createSymptom,
  exportSymptomsCsv,
  listSymptoms,
  summarizeSymptoms,
} = require("../services/symptomService");
const {
  bulkSymptomSchema,
  summaryQuerySchema,
  symptomQuerySchema,
  symptomSchema,
} = require("../validators/symptoms");

const router = express.Router();

router.use(requireAuth);
router.use(requirePatientAccess);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    console.log("=== INCOMING POST /symptoms REQUEST ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    const patientId = requirePatientId(req);
    console.log("Resolved Patient ID:", patientId);
    
    const payload = symptomSchema.parse(req.body);
    const item = await createSymptom(patientId, payload);
    
    console.log("=== SUCCESSFULLY CREATED SYMPTOM ===");
    res.status(201).json(item);
  })
);

router.post(
  "/bulk",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const payload = bulkSymptomSchema.parse(req.body);
    const result = await bulkCreateSymptoms(patientId, payload.items);
    res.status(201).json(result);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const query = symptomQuerySchema.parse(req.query);
    const items = await listSymptoms(patientId, query);
    res.json(items);
  })
);

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const query = summaryQuerySchema.parse(req.query);
    const summary = await summarizeSymptoms(patientId, query.period);
    res.json(summary);
  })
);

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const query = symptomQuerySchema.parse(req.query);
    const csv = await exportSymptomsCsv(patientId, query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=symptoms.csv");
    res.send(csv);
  })
);

module.exports = router;
