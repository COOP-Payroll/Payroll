const express = require("express");
const accountChecker = require("../controllers/account.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.post(
  "/",
  middleware.validateUserAgent,
  accountChecker.checkAccountNumber
);

module.exports = router;
