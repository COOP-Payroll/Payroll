// const express = require("express");
// const authcontroller = require("../controllers/authController");
// const middleware = require("../middleware/auth");
// const rateLimit = require('express-rate-limit');
// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     // Adjust this condition based on your authentication mechanism
//     return next(); // User is logged in, proceed to logout
//   } else {
//     res.status(401).json({ message: "User is not logged in" }); // User is not logged in
//   }
// }

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login requests per `windowMs`
//   message: 'Too many login attempts from this IP, please try again after 15 minutes',
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// const router = express.Router();

// router.post("/login/companyLogin",loginLimiter, authcontroller.login);
// router.post("/login/superAdmin", loginLimiter,authcontroller.superAdminLogin);
// // router.post("/employee/login", authcontroller.login)
// router.post("/auth/refreshToken", authcontroller.refreshToken);
// router.get("/logout", authcontroller.logout)

// // router.post('/forgetPassword', authcontroller.forgotPassword);
// // router.route('/resetPassword/:token').patch(authcontroller.resetPassword);
// // router.route('/updateMyPassword').patch(authcontroller.updatePassword);
// module.exports = router;

const express = require("express");
const authcontroller = require("../controllers/authController");
const middleware = require("../middleware/auth");
// const rateLimit = require("express-rate-limit");
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // Adjust this condition based on your authentication mechanism
    return next(); // User is logged in, proceed to logout
  } else {
    res.status(401).json({ message: "User is not logged in" }); // User is not logged in
  }
}

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login requests per `windowMs`
//   message:
//     "Too many login attempts from this IP, please try again after 15 minutes",
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

const router = express.Router();

router.post(
  "/login/companyLogin",

  middleware.validateUserAgent,
  // middleware.sanitizeInput,
  authcontroller.login
);
router.post(
  "/login/superAdmin",
  middleware.validateUserAgent,
  authcontroller.superAdminLogin
);
// router.post("/employee/login", authcontroller.login)
router.post(
  "/auth/refreshToken",
  middleware.validateUserAgent,
  authcontroller.refreshToken
);
router.get("/logout", middleware.validateUserAgent, authcontroller.logout);

// router.post('/forgetPassword', authcontroller.forgotPassword);
// router.route('/resetPassword/:token').patch(authcontroller.resetPassword);
// router.route('/updateMyPassword').patch(authcontroller.updatePassword);
module.exports = router;
