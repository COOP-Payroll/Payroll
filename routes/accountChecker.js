const express = require("express");
const accountChecker=require("../controllers/account.js")

const router = express.Router();

router.post(
  "/",
  accountChecker.checkAccountNumber);

  module.exports = router;
