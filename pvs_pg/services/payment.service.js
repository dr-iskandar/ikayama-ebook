const { default: axios } = require("axios");
const CryptoJS = require("crypto-js");

class PaymentService {
  static async create(req) {
    const {
      expires_in,
      order_id,
      user_id,
      merchant_name,
      payment_method,
      total_amount,
      customer_name,
      courier_agent,
      currency,
      push_url,
      callback_url,
    } = req.body;

    const clientKey =
      "8bbfef17034845e587733d06cb560aac67beb59b24c74e5282da6531fb824ba1";
    const clientId =
      "OGJiZmVmMTcwMzQ4NDVlNTg3NzMzZDA2Y2I1NjBhYWM2N2JlYjU5YjI0Yzc0ZTUyODJkYTY1MzFmYjgyNGJhMQ==";
    const clientSecret = "f751181f-315e-46db-baa2-d18fd3fe2c00";
    const timestamp = new Date().toISOString();

    const payloadToHashed = [
      expires_in,
      order_id,
      user_id,
      merchant_name,
      payment_method,
      total_amount,
      customer_name,
      currency,
      push_url,
      callback_url,
    ].join(":");

    const hashedPayload = CryptoJS.SHA256(payloadToHashed)
      .toString(CryptoJS.enc.Hex)
      .toLowerCase();

    const hmac = CryptoJS.HmacSHA256(
      `${hashedPayload}:${clientKey}:${timestamp}`,
      clientSecret
    );

    const signature = CryptoJS.enc.Base64.stringify(hmac);

    const headers = {
      Accept: "application/json",
    };

    const URL = "https://merchant-dev.pvpg.co.id:7977/api/v2.1/payment/create";

    try {
      const payloadPayment = {
        expires_in,
        order_id,
        user_id,
        merchant_name,
        payment_method,
        total_amount,
        customer_name,
        courier_agent,
        currency,
        push_url,
        callback_url,
        "x-client-id": clientId,
        "x-timestamp": timestamp,
        "x-signature": signature,
      };

      const result = await axios.post(URL, payloadPayment, {
        headers,
        withCredentials: true,
      });

      console.log("result", result.request.res.responseUrl);
      return {
        redirectUrl: result.request.res.responseUrl,
      };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  static async update(req) {
    const {
      transaction_id,
      payment_method,
      transaction_time,
      transaction_status,
      payment_id,
      order_id,
      amount,
      payment_status,
      payment_time,
      account_number,
      issuer_name,
    } = req.body;

    console.log("transaction_id", transaction_id);
    console.log("payment_method", payment_method);
    console.log("transaction_time", transaction_time);
    console.log("transaction_status", transaction_status);
    console.log("payment_id", payment_id);
    console.log("order_id", order_id);
    console.log("amount", amount);
    console.log("payment_status", payment_status);
    console.log("payment_time", payment_time);
    console.log("account_number", account_number);
    console.log("issuer_name", issuer_name);

    return req.body
  }
}

module.exports = PaymentService;
