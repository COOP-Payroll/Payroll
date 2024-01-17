const EbirrPayment = require("../models/chapaPayment.js");
const utils = require("../utils/generateUniqueId.js");
const axios = require("axios");

exports.EbirrPayment = async (req, res, next) => {
  try {
    const {
      requestId,
      accountNo,
      amount,
      referenceId,
      invoiceId,
      clientId,
      secrateKey,
      apiKey,
    } = req.body;
    const orderID = utils.generateOrderId();
    console.log(orderID);
    const eirrPaym = await EbirrPayment.findOne({
      where: { referenceId: referenceId },
    });
    if (eirrPaym) {
      return res.status(409).json({
        message: "Ebirr Payment Already Exists",
      });
    }
    const ebirrPayment = await EbirrPayment.create({
      orderID,
      requestId,
      referenceId,
      amount,
      accountNo,
      invoiceId,
    });
   
    const axiosInstance = axios.create({
      //   httpsAgent: httpsAgent,
    });
    const postData = {
      orderID,
      requestId,
      accountNo,
      amount,
      referenceId,
      invoiceId,
      clientId,
      secrateKey,
      apiKey,
    };

    await axiosInstance
      .post(process.env.PAYMENT_URLS + "EbirrPayment", postData)
      .then((response) => {
        if (response.status == 200) {
          ebirrPayment.paymentStatus = "Approved";
          ebirrPayment.transactionId = response.data.transactionId;
          ebirrPayment.issuerTransactionId = response.data.issuerTransactionId;
          ebirrPayment.save();
          return res.status(200).json({
            status: "success",
            data: response.data,
          });
        } else if (response.status == 409) {
          ebirrPayment.paymentStatus = "Failed";
          ebirrPayment.save();
          return res.status(409).json({
            status: "failure",
            message: "Ebirr Payment Already Exists",
          });
        } else {
          ebirrPayment.paymentStatus = "Failed";
          ebirrPayment.save();
          return res.status(response.status).json({
            status: "failure",
            message: response.data,
          });
        }
      })
      .catch((error) => 
      {
        console.error(error);
        ebirrPayment.paymentStatus = "Failed";
        ebirrPayment.save();
        return res.status(500).json(error.message);
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
