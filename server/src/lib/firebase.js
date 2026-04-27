const admin = require("firebase-admin");

let firebaseApp = null;

function buildCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (
    !projectId ||
    !clientEmail ||
    !privateKey ||
    projectId === "your-project-id" ||
    clientEmail.includes("your-project") ||
    privateKey.includes("YOUR_KEY")
  ) {
    return null;
  }

  try {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
  } catch (_error) {
    return null;
  }
}

function getFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const credential = buildCredential();

  if (!credential) {
    return null;
  }

  firebaseApp = admin.initializeApp({ credential });
  return firebaseApp;
}

function isFirebaseConfigured() {
  return Boolean(buildCredential());
}

module.exports = { admin, getFirebaseAdmin, isFirebaseConfigured };
