const { prisma } = require("../lib/prisma");
const { endOfRange, startOfRange } = require("../utils/date");

function buildSymptomWhere(patientId, query) {
  const recordedAt = {};
  const from = startOfRange(query.from);
  const to = endOfRange(query.to);

  if (from) {
    recordedAt.gte = from;
  }

  if (to) {
    recordedAt.lte = to;
  }

  return {
    patientId,
    ...(Object.keys(recordedAt).length ? { recordedAt } : {}),
  };
}

async function createSymptom(patientId, input) {
  return prisma.symptomLog.create({
    data: {
      patientId,
      ...input,
      note: input.note ?? null,
      recordedAt: input.recordedAt || new Date(),
    },
  });
}

async function bulkCreateSymptoms(patientId, items) {
  const result = await prisma.symptomLog.createMany({
    data: items.map((item) => ({
      patientId,
      ...item,
      note: item.note ?? null,
      recordedAt: item.recordedAt || new Date(),
    })),
  });

  return { count: result.count };
}

async function listSymptoms(patientId, query) {
  return prisma.symptomLog.findMany({
    where: buildSymptomWhere(patientId, query),
    orderBy: { recordedAt: "desc" },
    take: query.limit,
  });
}

async function summarizeSymptoms(patientId, period) {
  const days =
    period === "monthly" ? 30 : period === "weekly" ? 7 : 1;
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await prisma.symptomLog.findMany({
    where: {
      patientId,
      recordedAt: { gte: from },
    },
    orderBy: { recordedAt: "asc" },
  });

  const total = items.length || 1;
  const aggregate = items.reduce(
    (acc, item) => {
      acc.tremorLevel += item.tremorLevel;
      acc.rigidityLevel += item.rigidityLevel;
      acc.mood += item.mood;
      acc.energyLevel += item.energyLevel;
      return acc;
    },
    { tremorLevel: 0, rigidityLevel: 0, mood: 0, energyLevel: 0 }
  );

  return {
    period,
    count: items.length,
    averages: {
      tremorLevel: aggregate.tremorLevel / total,
      rigidityLevel: aggregate.rigidityLevel / total,
      mood: aggregate.mood / total,
      energyLevel: aggregate.energyLevel / total,
    },
    items,
  };
}

async function exportSymptomsCsv(patientId, query) {
  const items = await prisma.symptomLog.findMany({
    where: buildSymptomWhere(patientId, query),
    orderBy: { recordedAt: "asc" },
  });

  const header = [
    "recordedAt",
    "tremorLevel",
    "rigidityLevel",
    "walkingDifficulty",
    "freezingGait",
    "mood",
    "energyLevel",
    "source",
    "note",
  ];

  const rows = items.map((item) =>
    [
      item.recordedAt.toISOString(),
      item.tremorLevel,
      item.rigidityLevel,
      item.walkingDifficulty,
      item.freezingGait,
      item.mood,
      item.energyLevel,
      item.source,
      JSON.stringify(item.note || ""),
    ].join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

module.exports = {
  createSymptom,
  bulkCreateSymptoms,
  listSymptoms,
  summarizeSymptoms,
  exportSymptomsCsv,
};
