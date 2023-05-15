const express = require("express");
const authcontroller = require("../controllers/authController");

const router = express.Router();

router.post("/companyLogin", authcontroller.login);

module.exports = router;
