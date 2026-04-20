const { prisma } = require("../lib/prisma");

async function createTremorReading(patientId, input) {
  return prisma.sensorReading.create({
    data: {
      patientId,
      ...input,
      recordedAt: input.recordedAt || new Date(),
    },
  });
}

async function upsertBaseline(patientId, rmsBaseline) {
  return prisma.tremorBaseline.upsert({
    where: { patientId },
    update: { rmsBaseline },
    create: { patientId, rmsBaseline },
  });
}

async function getBaseline(patientId) {
  return prisma.tremorBaseline.findUnique({
    where: { patientId },
  });
}

async function syncStepEntry(patientId, input) {
  return prisma.stepEntry.upsert({
    where: {
      patientId_entryDate: {
        patientId,
        entryDate: input.entryDate,
      },
    },
    update: { stepCount: input.stepCount },
    create: {
      patientId,
      stepCount: input.stepCount,
      entryDate: input.entryDate,
    },
  });
}

async function getLatestSensorRms(patientId) {
  const reading = await prisma.sensorReading.findFirst({
    where: { patientId },
    orderBy: { recordedAt: "desc" },
  });

  return reading?.rms ?? null;
}

module.exports = {
  createTremorReading,
  upsertBaseline,
  getBaseline,
  syncStepEntry,
  getLatestSensorRms,
};
