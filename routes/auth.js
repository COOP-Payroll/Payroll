const express = require("express");
const authcontroller = require("../controllers/authController");

const router = express.Router();

router.post("/companyLogin", authcontroller.login);
router.post("/superAdmin", authcontroller.superAdminLogin);

module.exports = router;
