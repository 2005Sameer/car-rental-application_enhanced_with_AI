export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be under 5MB" : err.message;
    return res.status(400).json({ error: message });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}
