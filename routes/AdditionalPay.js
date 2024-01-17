const express = require("express");
const additionalPay = require("../controllers/additionalPay.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  additionalPay.getAllAdditionalPay
);
// router.get(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.getAllowanceById
// );

router.post(
  "/",
  
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionalPay.createAdditionalPay
  );

// router.put(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.updateAllowance
// );
// router.delete(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.deleteAllowance
// );

module.exports = router;
