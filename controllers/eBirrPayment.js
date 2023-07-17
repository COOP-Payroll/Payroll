const EbirrPayment = require("../models/e_birr.js");
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
    // await ebirrPayment.setMerchant(req.merchant);

    // Create an instance of the HTTPS agent
    // const httpsAgent = new https.Agent({
    //   cert: certificate,
    //   rejectUnauthorized: false,
    //   // Additional options if required (e.g., ca, passphrase, etc.)
    // });
    // const agent = new https.Agent({
    //   cert: cert,
    //   key: key,
    // });
    // Configure Axios to use the HTTPS agent
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.chapaPayment = async (req, res) => {
  try {
    const data = {
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

    const axiosInstance = await axiosInstance.post(
      process.env.PAYMENT_URLS + "EbirrPayment",
      postData
    );

    if(axiosInstance){

//  .then((response) => {
//         if (response.status == 200) {
//           ebirrPayment.paymentStatus = "Approved";
//           ebirrPayment.transactionId = response.data.transactionId;
//           ebirrPayment.issuerTransactionId = response.data.issuerTransactionId;
//           ebirrPayment.save();
//           return res.status(200).json({
//             status: "success",
//             data: response.data,
//           });
//         } else if (response.status == 409) {
//           ebirrPayment.paymentStatus = "Failed";
//           ebirrPayment.save();
//           return res.status(409).json({
//             status: "failure",
//             message: "Ebirr Payment Already Exists",
//           });
//         } else {
//           ebirrPayment.paymentStatus = "Failed";
//           ebirrPayment.save();
//           return res.status(response.status).json({
//             status: "failure",
//             message: response.data,
//           });
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//         ebirrPayment.paymentStatus = "Failed";
//         ebirrPayment.save();
//         return res.status(500).json(error.message);
//       });

    }



     
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
