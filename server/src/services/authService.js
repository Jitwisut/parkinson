const { prisma } = require("../lib/prisma");
const { getFirebaseAdmin } = require("../lib/firebase");
const { HttpError } = require("../utils/httpError");

async function verifyTokenAndResolveProfile(idToken) {
  const firebase = getFirebaseAdmin();

  if (!firebase) {
    throw new HttpError(503, "Firebase admin is not configured");
  }

  const decoded = await firebase.auth().verifyIdToken(idToken);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid: decoded.uid },
        ...(decoded.email ? [{ email: decoded.email }] : []),
      ],
    },
  });

  return { decoded, user };
}

async function registerUser(input) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      firebaseUid: input.firebaseUid ?? undefined,
      name: input.name,
      role: input.role,
      fcmToken: input.fcmToken ?? null,
    },
    create: {
      firebaseUid: input.firebaseUid ?? null,
      email: input.email,
      name: input.name,
      role: input.role,
      fcmToken: input.fcmToken ?? null,
    },
  });
}

module.exports = { verifyTokenAndResolveProfile, registerUser };
