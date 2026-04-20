const { getFirebaseAdmin, isFirebaseConfigured } = require("../lib/firebase");
const { prisma } = require("../lib/prisma");

function canUseDevAuth() {
  return process.env.ALLOW_DEV_AUTH === "true";
}

async function resolveDevUser(req) {
  if (!canUseDevAuth()) {
    return null;
  }

  const userId = req.headers["x-user-id"];
  if (!userId) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    return existingUser;
  }

  const email = req.headers["x-user-email"];
  const name = req.headers["x-user-name"] || "Dev User";
  const role = req.headers["x-user-role"] || "PATIENT";

  if (!email) {
    return null;
  }

  return prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      role,
    },
  });
}

async function resolveAuth(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const devUser = await resolveDevUser(req);
    return devUser ? { user: devUser, auth: null, mode: "dev" } : null;
  }

  const firebase = getFirebaseAdmin();

  if (!firebase) {
    return null;
  }

  const decoded = await firebase.auth().verifyIdToken(token);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid: decoded.uid },
        ...(decoded.email ? [{ email: decoded.email }] : []),
      ],
    },
  });

  return { user, auth: decoded, mode: "firebase" };
}

async function optionalAuth(req, _res, next) {
  try {
    const resolved = await resolveAuth(req);
    req.auth = resolved?.auth || null;
    req.user = resolved?.user || null;
  } catch (_error) {
    req.auth = null;
    req.user = null;
  }

  return next();
}

async function requireAuth(req, res, next) {
  try {
    const resolved = await resolveAuth(req);

    if (!resolved) {
      return res.status(401).json({
        error: isFirebaseConfigured()
          ? "Missing or invalid authentication"
          : "Authentication unavailable. Configure Firebase or enable dev auth.",
      });
    }

    if (!resolved.user) {
      return res.status(403).json({
        error: "Authenticated user does not have an application profile yet",
      });
    }

    req.auth = resolved.auth;
    req.user = resolved.user;
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { optionalAuth, requireAuth };
