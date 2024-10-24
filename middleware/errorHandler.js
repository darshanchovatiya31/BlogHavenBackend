const { StatusCodes } = require("http-status-codes");

class ErrorHandler extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
  

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.code || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message
  });
};


module.exports = {
  ErrorHandler,
  errorMiddleware,
};