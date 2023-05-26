const express = require("express");
const payroll = require("../controllers/newPayrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  payroll.getPayrollByPayrollDefId
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  payroll.createPayroll
);
// router.get(
//   "/",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   payroll.getActivePayroll
// );
// router.get("/nonPayrollEmployee/:id", payroll.getNonPayrollEmployee);
// router.get("/allEmployeePayroll/:id", payroll.getAllEmployeePayroll);
module.exports = router;
