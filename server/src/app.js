const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const symptomRoutes = require("./routes/symptoms");
const medicationRoutes = require("./routes/medications");
const alertRoutes = require("./routes/alerts");
const sensorRoutes = require("./routes/sensor");
const caregiverRoutes = require("./routes/caregiver");
const reportRoutes = require("./routes/reports");
const { errorHandler, notFoundHandler } = require("./middleware/error");
const { getHealthStatus } = require("./services/healthService");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", async (_req, res) => {
    const health = await getHealthStatus();
    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  });

  app.use("/auth", authRoutes);
  app.use("/symptoms", symptomRoutes);
  app.use("/medications", medicationRoutes);
  app.use("/alerts", alertRoutes);
  app.use("/sensor", sensorRoutes);
  app.use("/caregiver", caregiverRoutes);
  app.use("/reports", reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
