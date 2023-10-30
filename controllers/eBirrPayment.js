const EbirrPayment = require("../models/e_birr.js");
const utils = require("../utils/generateUniqueId.js");
const axios = require("axios");

const ChapaPayment=require("../models/chapa.js")
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
    const ebirr_Payment = await EbirrPayment.findOne({
      where: { referenceId: referenceId },
    });
    if (ebirr_Payment) {
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
      .catch((error) => {
        console.error(error);
        ebirrPayment.paymentStatus = "Failed";
        ebirrPayment.save();
        return res.status(500).json(error.message);
      });
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.ChapaPayment=async (req,res,next)=>{
  try {
    const email = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const tx_ref = req.body.tx_ref;
    const title = req.body.title;
    const amount = req.body.amount;
    const currency = req.body.currency;
    const description = req.body.description;
    const callBackUrl = req.body.callBackUrl;
    const returnUrl = req.body.returnUrl;
    const authToken = req.body.authToken;
 
    const axiosInstance = axios.create({
    //   httpsAgent: httpsAgent,
    });
    const postData = {
      email,
      first_name,
      last_name,
      tx_ref,
      title,
      amount,
      currency,
      description,
      authToken,
    };


    const chapa = await ChapaPayment.findOne({
      where: {
        tx_ref: tx_ref,
      },
    });
    if (chapa) {
      res.status(409).json({ message: "Transaction Already Exists" });
    } else {
      const chapaPay = await ChapaPayment.create({
        email: email,
        currency: currency,
        amount: amount,
        return_url: returnUrl,
        first_name: first_name,
        last_name: last_name,
        tx_ref: tx_ref,
        title: title,
        callback_url: callBackUrl,
      });
    
      await chapaPay.save();
      await axiosInstance
        .post(
          process.env.PAYMENT_URLS + "chapainitiate",
          {
            email,
            authToken,
            first_name,
            last_name,
            tx_ref,
            title,
            amount,
            currency,
            description,
            return_url: returnUrl,
            // orderId,
          }
        )
        .then((response) => {
          if (response.status === 200) {
            console.log("response Data", response.data.data.checkout_url);
            chapaPay.cheackoutUrl = response.data.data.checkout_url;
            chapaPay.paymentStatus = "PENDING";
            chapaPay.save();
            return res.status(200).json(response.data);
          }
          return res.status(500).json({ message: "Error" });
        })
        .catch((error) => {
          console.error(error.message);
          return res.status(500).json(error.message);
        });
    }
  } catch (error) {
     console.error("Error: " + error);
     return res.status(500).send({
       message: error,
     });
  }
}


