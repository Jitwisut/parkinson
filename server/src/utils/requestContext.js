const { HttpError } = require("./httpError");

function getCurrentPatientId(req) {
  return (
    req.headers["x-patient-id"] ||
    req.user?.id ||
    req.body?.patientId ||
    req.query?.patientId
  );
}

function getCurrentCaregiverId(req) {
  return req.headers["x-caregiver-id"] || req.user?.id;
}

function requirePatientId(req) {
  const patientId = getCurrentPatientId(req);

  if (!patientId) {
    throw new HttpError(
      400,
      "Patient context is required. Provide Firebase auth or x-patient-id."
    );
  }

  return patientId;
}

function requireCaregiverId(req) {
  const caregiverId = getCurrentCaregiverId(req);

  if (!caregiverId) {
    throw new HttpError(
      400,
      "Caregiver context is required. Provide Firebase auth or x-caregiver-id."
    );
  }

  return caregiverId;
}

module.exports = {
  getCurrentPatientId,
  requirePatientId,
  requireCaregiverId,
};
