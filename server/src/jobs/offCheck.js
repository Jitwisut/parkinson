const cron = require("node-cron");
const { evaluatePatient, getActivePatients } = require("../services/offDetector");
const { sendPushNotification } = require("../services/notificationService");
const { listCaregiversForPatient } = require("../services/caregiverService");

function startOffCheckJob(io) {
  const schedule = process.env.OFF_CHECK_CRON || "*/5 * * * *";

  return cron.schedule(schedule, async () => {
    const patients = await getActivePatients();

    for (const patient of patients) {
      const alert = await evaluatePatient(patient.id);

      if (!alert) {
        continue;
      }

      await sendPushNotification(patient.fcmToken, {
        title: "Possible OFF period detected",
        body: "Please check symptoms and medication status.",
        data: {
          alertId: alert.id,
          patientId: patient.id,
          severity: alert.severity,
        },
      });

      const caregivers = await listCaregiversForPatient(patient.id);
      for (const caregiver of caregivers) {
        await sendPushNotification(caregiver.fcmToken, {
          title: "Patient alert",
          body: `${patient.name} may be entering an OFF period.`,
          data: {
            alertId: alert.id,
            patientId: patient.id,
          },
        });
      }

      io.to(`patient:${patient.id}`).emit("off_alert", alert);
      for (const caregiver of caregivers) {
        io.to(`caregiver:${caregiver.id}`).emit("off_alert", alert);
      }
    }
  });
}

module.exports = { startOffCheckJob };
