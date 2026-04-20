const { prisma } = require("../lib/prisma");
const { offRules } = require("../config/offRules");
const { createAlert } = require("./alertService");
const { getNextOverdueDose } = require("./medicationService");
const { getLatestSensorRms, getBaseline } = require("./sensorService");

function getOverdueMinutes(log) {
  const now = Date.now();
  const scheduled = new Date(log.scheduledAt).getTime();
  return Math.floor((now - scheduled) / 60000);
}

async function getLatestSymptom(patientId) {
  return prisma.symptomLog.findFirst({
    where: { patientId },
    orderBy: { recordedAt: "desc" },
  });
}

async function getActivePatients() {
  return prisma.user.findMany({
    where: { role: "PATIENT" },
  });
}

async function evaluatePatient(patientId) {
  const [latestSymptom, nextDose, latestRms, baseline] = await Promise.all([
    getLatestSymptom(patientId),
    getNextOverdueDose(patientId),
    getLatestSensorRms(patientId),
    getBaseline(patientId),
  ]);

  if (latestSymptom?.tremorLevel >= offRules.tremorThreshold) {
    return createAlert(patientId, "symptom_score", "warning");
  }

  if (nextDose && getOverdueMinutes(nextDose) > offRules.missedDoseMinutes) {
    return createAlert(patientId, "missed_dose", "critical");
  }

  if (
    latestRms &&
    baseline?.rmsBaseline &&
    latestRms > baseline.rmsBaseline * offRules.sensorRmsMultiplier
  ) {
    return createAlert(patientId, "sensor", "warning");
  }

  return null;
}

module.exports = { getActivePatients, evaluatePatient };
