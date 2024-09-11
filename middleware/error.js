class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace in V8 engines like Node.js
    Error.captureStackTrace(this, this.constructor);
  }
  // Static method for errors
  static allErrors(message = "Bad Request", statusCode = 400) {
    return new ErrorHandler(message, statusCode);
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
    const message = "Invalid Web Token. Please try again."; // invalid json web token
    err = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired. Please log in again."; //json web token
    err = new ErrorHandler(message, 400);
  }

  // Return the response with the appropriate status code and error message
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorHandler;
