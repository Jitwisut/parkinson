const { prisma } = require("../lib/prisma");

async function listAlerts(patientId) {
  return prisma.offAlert.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

async function listAlertHistory(patientId) {
  return prisma.offAlert.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

async function createAlert(patientId, trigger, severity) {
  return prisma.offAlert.create({
    data: {
      patientId,
      trigger,
      severity,
    },
  });
}

async function resolveAlert(patientId, alertId, resolved) {
  await prisma.offAlert.updateMany({
    where: { id: alertId, patientId },
    data: { resolved },
  });

  return prisma.offAlert.findFirst({
    where: { id: alertId, patientId },
  });
}

module.exports = { listAlerts, listAlertHistory, createAlert, resolveAlert };
