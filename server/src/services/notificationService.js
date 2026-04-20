const { getFirebaseAdmin } = require("../lib/firebase");

async function sendPushNotification(token, payload) {
  const firebase = getFirebaseAdmin();

  if (!firebase || !token) {
    return { delivered: false, reason: "missing_firebase_or_token" };
  }

  const message = {
    token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
  };

  if (process.env.FCM_DRY_RUN === "true") {
    return { delivered: false, reason: "dry_run", message };
  }

  const response = await firebase.messaging().send(message);
  return { delivered: true, response };
}

module.exports = { sendPushNotification };
