// const express = require("express");
// const stripe = require("stripe")(
//   "sk_test_51O4eU1KbKTkmqaO6umS2102JQqzGLqQHUaourjZ6IyE4PbNhpKC9rCkPcNtrVMaT1CaCAqlbgT3DcbkWyw9dT3RZ00H3fZmbxg"
// );

// const stripeSecretKey =
//   "sk_test_51O4eU1KbKTkmqaO6umS2102JQqzGLqQHUaourjZ6IyE4PbNhpKC9rCkPcNtrVMaT1CaCAqlbgT3DcbkWyw9dT3RZ00H3fZmbxg"; // Replace with your Stripe secret key
// const serverURL = "http://localhost:6000/";
// // Define the payment data
// const paymentData = {
//   amount: 1000, // Amount in cents
//   currency: 'usd',
// };
// const headers = {
//   Authorization: `Bearer ${stripeSecretKey}`,
//   "Content-Type": "application/json",
// };

// // Make the HTTP POST request to your server
// axios.post(`${serverURL}/create-payment-intent`, paymentData, { headers })
//   .then(response => {
//     console.log('Payment intent created:');
//     console.log(response.data);
//   })
//   .catch(error => {
//     console.error('Error creating payment intent:');
//     console.error(error.response.data);
//   });
// // const intent = await stripe.paymentIntents.create({
// //   amount: 1000, // Amount in cents
// //   currency: "usd",
// //   description: "Example Payment",
// // });

// // const { paymentMethodId } = req.body;

// // const confirm = await stripe.paymentIntents.confirm(intent.id, {
// //   payment_method: paymentMethodId,
// // });
// exports.create_Payment = async (req, res, next) => {
//   try {
//     const intent = await stripe.paymentIntents.create({
//       amount: 1000, // Amount in cents
//       currency: "usd",
//       description: "Example Payment",
//     });

//     console.log("intent", intent);
//     return res.status(200).json({
//       message: "successfully completted",
//     });
//   } catch (error) {
//     console.log("Error", error);
//     if (error.name === "SequelizeValidationError") {
//       const validationErrors = error.errors.map((error) => ({
//         field: error.path,
//         message: error.message,
//       }));
//       return res.status(400).json(validationErrors);
//     }

//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.pay = async (req, res, next) => {
//   const { amount, currency } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//     });
//     res.json({ clientSecret: paymentIntent });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const https = require("https");

// // Replace with your server details and payment data
// const serverHostname = "http://localhost:6000/"; // Replace with your server's hostname
// const serverPath = "/create-payment-intent"; // Replace with the path to your payment intent creation endpoint
// const stripeSecretKey =
//   "sk_test_51O4eU1KbKTkmqaO6umS2102JQqzGLqQHUaourjZ6IyE4PbNhpKC9rCkPcNtrVMaT1CaCAqlbgT3DcbkWyw9dT3RZ00H3fZmbxg"; // Replace with your Stripe secret key

// const paymentData = {
//   amount: 1000, // Amount in cents
//   currency: "usd",
// };

// const postData = JSON.stringify(paymentData);

// const options = {
//   hostname: serverHostname,
//   port: 443, // Port for HTTPS
//   path: serverPath,
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${stripeSecretKey}`,
//     "Content-Type": "application/json",
//     "Content-Length": postData.length,
//   },
// };

// const req = https.request(options, (res) => {
//   let data = "";

//   res.on("data", (chunk) => {
//     data += chunk;
//   });

//   res.on("end", () => {
//     console.log("Response from the server:");
//     console.log(data);
//   });
// });

// req.on("error", (error) => {
//   console.error("Error making the request:");
//   console.error(error);
// });

// req.write(postData);
// req.end();

// // Create a new charge
// exports.charge = async (req, res) => {
//   const { amount, source, description } = req.body;

//   try {
//     const charge = await stripe.charges.create({
//       amount: amount, // amount in cents
//       currency: "usd",
//       source: source, // Stripe token obtained with Stripe.js
//       description: description,
//     });

//     res.status(200).json({ message: "Payment successful" });
//   } catch (error) {
//     console.error("Error processing payment:", error);
//     res.status(500).json({ error: "Payment failed" });
//   }
// };
