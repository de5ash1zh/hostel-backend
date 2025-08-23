import createHttpError from "http-errors";

export function errorHandler(err, req, res, next) {
  console.error(err); // Log for debugging

  // HTTP errors from http-errors package
  if (createHttpError.isHttpError(err)) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Prisma or other database errors
  if (err.code === "P2002") {
    // Unique constraint failed
    return res.status(409).json({ message: "Duplicate entry" });
  }

  // Default fallback
  res.status(500).json({ message: "Internal Server Error" });
}
