const express = require("express");
const authcontroller = require("../controllers/authController");
const middleware = require("../middleware/auth");

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // Adjust this condition based on your authentication mechanism
    return next(); // User is logged in, proceed to logout
  } else {
    res.status(401).json({ message: "User is not logged in" }); // User is not logged in
  }
}

const router = express.Router();

router.post("/login/companyLogin", authcontroller.login);
router.post("/login/superAdmin", authcontroller.superAdminLogin);
router.post("/employee/login", authcontroller.login)
router.post("/auth/refreshToken", authcontroller.refreshToken);
router.get("/logout", authcontroller.logout)



// router.post('/forgetPassword', authcontroller.forgotPassword);
// router.route('/resetPassword/:token').patch(authcontroller.resetPassword);
// router.route('/updateMyPassword').patch(authcontroller.updatePassword);
module.exports = router;
