const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log("err", err.message);
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Internal Server Error",
    status: err.status || "error",
  };

  if (err.name === "TokenExpiredError") {
    customError.status = "unauthorized";
    customError.msg = "Your access token has expired. Please relogin.";
    customError.statusCode = 401;
  }

  if (err.name === "JsonWebTokenError") {
    customError.status = "unauthorized";
    customError.msg = "Your access token is invalid.";
    customError.statusCode = 401;
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    customError.status = "error";
    customError.msg =
      "Unique data violation. Please recheck your data if there is data that already exists in our system";
    customError.statusCode = 400;
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    customError.status = "error";
    customError.msg = "Invalid Request Date. Please recheck your request data";
    customError.statusCode = 400;
  }

  if (!err.name) {
    customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    customError.msg = "Internal Server Error";
    customError.status = "error";
  }

  return res
    .status(customError.statusCode)
    .json({ status: customError.status, message: customError.msg });
};

module.exports = errorHandlerMiddleware;
