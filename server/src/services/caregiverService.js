const { prisma } = require("../lib/prisma");

async function listPatientsForCaregiver(caregiverId) {
  const links = await prisma.patientCaregiver.findMany({
    where: { caregiverId },
    include: {
      patient: true,
    },
  });

  return links.map((item) => item.patient);
}

async function getPatientStatus(patientId) {
  const [patient, latestSymptom, latestAlert, compliance] = await Promise.all([
    prisma.user.findUnique({ where: { id: patientId } }),
    prisma.symptomLog.findFirst({
      where: { patientId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.offAlert.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.medicationLog.findMany({
      where: { patientId },
      orderBy: { scheduledAt: "desc" },
      take: 20,
    }),
  ]);

  const total = compliance.length || 1;
  const taken = compliance.filter((item) => item.status === "TAKEN").length;

  return {
    patient,
    latestSymptom,
    latestAlert,
    medicationCompliance: Number(((taken / total) * 100).toFixed(2)),
  };
}

async function listCaregiversForPatient(patientId) {
  const links = await prisma.patientCaregiver.findMany({
    where: { patientId },
    include: { caregiver: true },
  });

  return links.map((item) => item.caregiver);
}

module.exports = {
  listPatientsForCaregiver,
  getPatientStatus,
  listCaregiversForPatient,
};
