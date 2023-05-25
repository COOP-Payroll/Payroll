const express = require("express");
const additionalDeductionControllers = require("../controllers/additionalDeduction.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.getAllAdditionalDeduction
);
// // router.get("/:id", allowance.getAllowanceById);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionalDeductionControllers.createAdditionalDeduction
);
// router.put(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   additionalDeductionControllers.updateAdditionalDeduction
// );
// router.delete(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   additionalDeductionControllers.deleteAdditionalDeduction
// );

module.exports = router;
