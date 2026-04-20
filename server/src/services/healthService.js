const { prisma } = require("../lib/prisma");
const { isFirebaseConfigured } = require("../lib/firebase");

async function getHealthStatus() {
  let database = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch (_error) {
    database = "down";
  }

  return {
    status: database === "up" ? "ok" : "degraded",
    service: "parkinson-care-backend",
    timestamp: new Date().toISOString(),
    dependencies: {
      database,
      firebase: isFirebaseConfigured() ? "configured" : "not_configured",
      devAuth: process.env.ALLOW_DEV_AUTH === "true" ? "enabled" : "disabled",
    },
  };
}

module.exports = { getHealthStatus };
