// // ERROR MIDDLEWARE | NEXT FUNCTION

// const errorMiddleware = (err, req, res, next) => {
//     const defaultError = {
//       statusCode: 404,
//       status: "failed",
//       message: err,
//     };

//     if (err?.name === "ValidationError") {
//       defaultError.statusCode = 404;

//       defaultError.message = Object.values(err, errors)
//         .map((el) => el.message)
//         .join(",");
//     }

//     //duplicate error

//     if (err.code && err.code === 11000) {
//       defaultError.statusCode = 404;
//       defaultError.message = `${Object.values(
//         err.keyValue
//       )} field has to be unique!`;
//     }

//     res.status(defaultError.statusCode).json({
//       status: defaultError.status,
//       message: defaultError.message,
//     });
//   };

//   export default errorMiddleware;

class ErrorHandler extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 500;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.code = 1;
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error.";

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again.`;
    err = new ErrorHandler(message, 400);
  }
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, Try again.`;
    err = new ErrorHandler(message, 400);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code,
  });
};

export default ErrorHandler;
