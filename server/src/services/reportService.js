const PDFDocument = require("pdfkit");
const { prisma } = require("../lib/prisma");

async function getMonthlyReport(patientId) {
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [symptoms, medicationLogs, alerts] = await Promise.all([
    prisma.symptomLog.findMany({
      where: { patientId, recordedAt: { gte: from } },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.medicationLog.findMany({
      where: { patientId, scheduledAt: { gte: from } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.offAlert.findMany({
      where: { patientId, createdAt: { gte: from } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalLogs = medicationLogs.length || 1;
  const taken = medicationLogs.filter((item) => item.status === "TAKEN").length;

  return {
    patientId,
    rangeDays: 30,
    symptomCount: symptoms.length,
    offEpisodeCount: alerts.length,
    medicationCompliance: Number(((taken / totalLogs) * 100).toFixed(2)),
    symptoms,
    medicationLogs,
    alerts,
  };
}

async function buildMonthlyPdf(patientId) {
  const report = await getMonthlyReport(patientId);
  const doc = new PDFDocument();
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).text("Parkinson Care Assistant", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Patient ID: ${patientId}`);
  doc.text(`Symptom logs: ${report.symptomCount}`);
  doc.text(`Medication compliance: ${report.medicationCompliance}%`);
  doc.text(`OFF episodes: ${report.offEpisodeCount}`);
  doc.moveDown();
  doc.text("This PDF is a scaffold output and should be refined with charts.");
  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));

  return Buffer.concat(chunks);
}

module.exports = { getMonthlyReport, buildMonthlyPdf };
