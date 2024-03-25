const nodemailer = require("nodemailer");
const { promisify } = require("util");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: "mfzyfdiaxqnwmzqi",
  },
  tls: {
    rejectUnauthorized: false, // Disable certificate validation (use with caution)
  },
  // tls: {
  //   rejectUnauthorized: false, // bypass SSL certificate verification
  // },
});

const sendMailAsync = promisify(transporter.sendMail.bind(transporter));

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await sendMailAsync(mailOptions);

    console.log("Email sent: " + info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Propagate the error for consistent error handling
  }
};

module.exports = sendEmail;






// const nodemailer = require("nodemailer");

// const sendEmail = async (options, req, res, next) => {
//   {
//     try {
//       // let testAccount = await nodemailer.createTestAccount();
//       var transporter = nodemailer.createTransport({
//         //service: "hotmail",
//         service: "gmail",
//         //port: 587,//Yahoo
//         port: 465, //Gmail
//         secure: false,
//         auth: {
//           user: process.env.EMAIL,
//           pass: "mfzyfdiaxqnwmzqi",
//           // user: "gemechubulti@outlook.com",
//           // pass: 'gemechu@outlook@11',
//         },
//       });

//       var mailOptions = {
//         from: process.env.EMAIL,
//         // to:'milkessagabai@gmail.com',
//         // to:'etanaalemunew@gmail.com',

//         to: options.message1.to,

//         // to: 'geme11.bulti@gmail.com',
//       subject: options.message1.subject,
//     html: options.message1.html,
//         // text: "Thank you so much for your patience. I'm sorry it took so long for me to get back to you I truly appreciate your understanding and willingness to wait It was a difficult situation, and I'm glad you were so understanding I want to thank you again for your patience It was much appreciated and it helped me a lot It's hard to ask for help but it's even harder to wait Thank you for making it easier Your kindness is much appreciated Thank you for being so understanding ",
//       };
//       transporter.sendMail(mailOptions, req, res, next, function (error, info) {
//         if (error) {
//           console.log(error.message);
//           //next(error);

//           //  res.status(500).json({ message: 'Error while sending email', error });
//           res.status(404).json(error);
//         } else {
//           console.log("Email sent: " + info.response);
//           res.status(250).json(info.response);
//         }
//       });
//     } catch (error) {
//       throw error;
//     }
//   }
// };
// module.exports = sendEmail;
