const { ZodError } = require("zod");

function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
}

function errorHandler(error, _req, res, _next) {
  console.error("=== ERROR HANDLER ===", error);
  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const firstField = Object.keys(fieldErrors)[0];
    const firstMessage = fieldErrors[firstField]?.[0] || "Invalid input";
    
    return res.status(400).json({
      error: `Validation error on ${firstField}: ${firstMessage}`,
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
