const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { requirePatientId } = require("../utils/requestContext");
const { buildMonthlyPdf, getMonthlyReport } = require("../services/reportService");
const { requirePatientAccess } = require("../middleware/authorization");

const router = express.Router();

router.use(requireAuth);
router.use(requirePatientAccess);

router.get(
  "/monthly",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const report = await getMonthlyReport(patientId);
    res.json(report);
  })
);

router.get(
  "/pdf",
  asyncHandler(async (req, res) => {
    const patientId = requirePatientId(req);
    const pdf = await buildMonthlyPdf(patientId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly-report.pdf");
    res.send(pdf);
  })
);

module.exports = router;
