const { prisma } = require("../lib/prisma");

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient role" });
    }

    return next();
  };
}

async function requirePatientAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const patientId =
    req.patientContextId ||
    req.headers["x-patient-id"] ||
    req.query.patientId ||
    req.body.patientId ||
    req.user.id;

  if (req.user.role === "PATIENT" && req.user.id === patientId) {
    req.patientContextId = patientId;
    return next();
  }

  if (req.user.role === "DOCTOR") {
    req.patientContextId = patientId;
    return next();
  }

  if (req.user.role === "CAREGIVER") {
    const link = await prisma.patientCaregiver.findUnique({
      where: {
        patientId_caregiverId: {
          patientId,
          caregiverId: req.user.id,
        },
      },
    });

    if (link) {
      req.patientContextId = patientId;
      return next();
    }
  }

  return res.status(403).json({ error: "You do not have access to this patient" });
}

function requirePatientParamAccess(paramName = "id") {
  return function patientParamGuard(req, _res, next) {
    req.patientContextId = req.params[paramName];
    return requirePatientAccess(req, _res, next);
  };
}

module.exports = { requireRole, requirePatientAccess, requirePatientParamAccess };
