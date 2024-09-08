class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace in V8 engines like Node.js
    Error.captureStackTrace(this, this.constructor);
  }

  // Static method for "Not Found" errors
  static notFound(message = "Resource not found") {
    return new ErrorHandler(message, 404);
  }

  // Static method for "Unauthorized" errors
  static unauthorized(message = "Unauthorized access") {
    return new ErrorHandler(message, 401);
  }

  // Static method for "Duplicate" errors
  static duplicate(message = "Duplicate field value entered") {
    return new ErrorHandler(message, 400);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Default status code and message
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  // Handle specific errors
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}.`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `Duplicate field value entered for: ${Object.keys(
      err.keyValue
    )}.`;
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid JSON Web Token. Please try again.";
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired. Please log in again.";
    err = new ErrorHandler(message, 400);
  }

  // Return the response with the appropriate status code and error message
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
