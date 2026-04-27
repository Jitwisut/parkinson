const { prisma } = require("../lib/prisma");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../services/authService");

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) return null;
    
    // Omit password from returned user object in req.user
    const { password, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, auth: decoded, mode: "jwt" };
  } catch (error) {
    return null;
  }
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

    if (!resolved || !resolved.user) {
      return res.status(401).json({
        error: "Missing, invalid, or expired authentication token",
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
