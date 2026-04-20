const { prisma } = require("../lib/prisma");

async function listMedications(patientId) {
  return prisma.medication.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

async function createMedication(patientId, input) {
  return prisma.medication.create({
    data: {
      patientId,
      ...input,
      doseMg: input.doseMg ?? null,
    },
  });
}

async function updateMedication(patientId, medicationId, input) {
  await prisma.medication.updateMany({
    where: { id: medicationId, patientId },
    data: {
      ...input,
      doseMg: input.doseMg ?? null,
    },
  });

  return prisma.medication.findFirst({
    where: { id: medicationId, patientId },
  });
}

async function deleteMedication(patientId, medicationId) {
  return prisma.medication.deleteMany({
    where: { id: medicationId, patientId },
  });
}

async function createMedicationLog(patientId, medicationId, input) {
  return prisma.medicationLog.create({
    data: {
      patientId,
      medicationId,
      status: input.status,
      scheduledAt: input.scheduledAt,
      takenAt: input.takenAt ?? (input.status === "TAKEN" ? new Date() : null),
    },
  });
}

async function listMedicationLogs(patientId) {
  return prisma.medicationLog.findMany({
    where: { patientId },
    include: { medication: true },
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });
}

async function getMedicationCompliance(patientId) {
  const logs = await prisma.medicationLog.findMany({
    where: { patientId },
  });

  const total = logs.length || 1;
  const taken = logs.filter((item) => item.status === "TAKEN").length;

  return {
    totalLogs: logs.length,
    takenLogs: taken,
    complianceRate: Number(((taken / total) * 100).toFixed(2)),
  };
}

async function getNextOverdueDose(patientId) {
  return prisma.medicationLog.findFirst({
    where: {
      patientId,
      takenAt: null,
      scheduledAt: { lt: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

module.exports = {
  listMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  createMedicationLog,
  listMedicationLogs,
  getMedicationCompliance,
  getNextOverdueDose,
};
