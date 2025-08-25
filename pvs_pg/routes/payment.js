const paymentRouter = require("express").Router();
const PaymentController = require("../controllers/payment.controller.js");

paymentRouter.post("/create", PaymentController.store);
paymentRouter.post("/update", PaymentController.update);

module.exports = paymentRouter;
