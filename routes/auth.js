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
const rateLimit = require("express-rate-limit");
const createError = require("../utils/error");
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // Adjust this condition based on your authentication mechanism
    return next(); // User is logged in, proceed to logout
  } else {
    res.status(401).json({ message: "User is not logged in" }); // User is not logged in
  }
}

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `windowMs`
  // message:
  //   "Too many login attempts from this IP, please try again after 15 minutes",

  handler: (req, res, next) => {
    // Custom handler using createError
    next(
      createError.createError(
        429,
        "Too many login attempts from this IP, please try again after 10 minutes"
      )
    );
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = express.Router();
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/login/companyLogin:
 *   post:
 *     summary: Login for Company User
 *     description: Logs in a company user using their email, password, and company code, and returns a JWT token upon successful authentication.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the company user.
 *                 example: "test@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the company user.
 *                 example: "testC@#1234"
 *               companyCode:
 *                 type: string
 *                 description: The company code for authentication.
 *                 example: "test"
 *     responses:
 *       '200':
 *         description: Successful login, JWT token returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticating further requests.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJyb2xlIjoibGVnYWwiLCJleHBpcmVkX2Zyb20iOiJ5b3VydGVuIiwiZXhwIjoxNjYyOTQwNzUwfQ.Ovpxk3Y1UP-5Jv9YH8KzZ6WhpaCzYP5MshhOeReKtTI"
 *       '400':
 *         description: Bad Request - Missing required fields (email, password, or company code).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide email, password, or company code"
 *       '401':
 *         description: Unauthorized - Invalid credentials, or account status is blocked/denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       '503':
 *         description: Service unavailable - Error occurred during login process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred, please try again later"
 */

router.post(
  "/login/companyLogin",
  // loginLimiter,
  // middleware.validateUserAgent,
  // middleware.sanitizeInput,
  authcontroller.login
);
/**
 * @swagger
 * /api/login/superAdmin:
 *   post:
 *     summary: Login for Super Admin
 *     description: Logs in a super admin using their email and password, and returns a JWT token upon successful authentication.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the super admin.
 *                 example: "admin@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the super admin.
 *                 example: "test"
 *     responses:
 *       '200':
 *         description: Successful login, JWT token returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticating further requests.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJyb2xlIjoic3VwZXIiLCJleHBpcmVkX2Zyb20iOiJzeW1wbGVhZGluIiwiZXhwIjoxNjYyOTQwNzUwfQ.Ovpxk3Y1UP-5Jv9YH8KzZ6WhpaCzYP5MshhOeReKtTI"
 *       '400':
 *         description: Bad Request - Missing required fields (email or password).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide email or password"
 *       '401':
 *         description: Unauthorized - Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid credentials"
 *       '503':
 *         description: Service unavailable - Error occurred during login process.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred, please try again later"
 */

router.post(
  "/login/superAdmin",
  loginLimiter,
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
