const { StatusCodes } = require("http-status-codes");
const { create, update } = require("../services/payment.service");

class PaymentController {
  static async store(req, res, next) {
    try {
      const result = await create(req);

      res.status(StatusCodes.CREATED).json({
        status: "success",
        content: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await update(req);

      res.status(StatusCodes.OK).json({
        status: "success",
        content: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController