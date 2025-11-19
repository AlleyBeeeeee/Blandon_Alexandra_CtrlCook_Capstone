export const notFound = (req, res, next) => {
  // creates a new error object for the unmatched route
  const error = new Error(`not found - ${req.originalUrl}`);
  res.status(404); // sets the response status code to 404
  next(error); // forwards the error to the general error handler
};

export const errorHandler = (err, req, res, next) => {
  // check if the status code is already set to something specific (e.g., 401, 400)
  // otherwise, default to 500 (Internal Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // special case for Mongoose CastError (e.g., invalid ObjectId format)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "resource not found";
    statusCode = 404;
  }

  // sends the standardized JSON error response
  res.status(statusCode).json({
    message: message,
    // only include the stack trace in development mode for debugging
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
