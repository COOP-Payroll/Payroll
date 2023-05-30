const express = require("express");
const payroll = require("../controllers/payrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get("/:id", payroll.getAllPayrollByCompanyId);
router.post("/par",
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
router.get("/nonPayrollEmployee/:id", payroll.getNonPayrollEmployee);
router.get("/allEmployeePayroll/:id", payroll.getAllEmployeePayroll);
router.get(
  "/payslip/:id",
  middleware.protectAll,
  middleware.restrictTo("employee"),
  payroll.employeePaySlip
);


module.exports = router;
