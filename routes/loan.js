const express = require("express");
const loanControllers = require("../controllers/loan.js");
const middleware=require('../middleware/auth.js')
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  loanControllers.getAllLoan
);
// router.get("/:id", allowance.getAllowanceById);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  loanControllers.createAllowance
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  loanControllers.updateLoan
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  loanControllers.deleteLoan
);

module.exports = router;
