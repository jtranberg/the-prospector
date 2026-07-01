// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  console.error("Unhandled API error:", {
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });

  return res.status(500).json({
    ok: false,
    error: "Something went wrong. Please try again.",
  });
}