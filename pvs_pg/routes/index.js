const router = require("express").Router();
const paymentRouter = require("./payment");

router.use("/payment", paymentRouter);

module.exports = router;