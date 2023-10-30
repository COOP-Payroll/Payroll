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

router.post("/companyLogin", authcontroller.login);
router.post("/superAdmin", authcontroller.superAdminLogin);
router.get("/logout", authcontroller.logout)

module.exports = router;
