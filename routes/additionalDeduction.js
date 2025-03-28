const express = require("express");
const additionalDeductionControllers = require("../controllers/additionalDeduction.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.getAllAdditionalDeduction
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.getAdditionalDeductionById
);

//
// // router.get("/:id", allowance.getAllowanceById);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.createAdditionalDeduction
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.copyAndUpdateAdditionalDeduction
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.deleteAdditionalDeduction
);

module.exports = router;
