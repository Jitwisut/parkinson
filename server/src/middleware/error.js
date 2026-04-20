const { ZodError } = require("zod");

function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: error.flatten(),
    });
  }

  const status = error.status || 500;

  return res.status(status).json({
    error: error.message || "Internal Server Error",
    details: error.details,
  });
}

module.exports = { notFoundHandler, errorHandler };
