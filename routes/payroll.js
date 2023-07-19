const express = require("express");
const payroll = require("../controllers/payrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get("/:id", payroll.getAllPayrollByCompanyId);

router.post(
  "/par",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.createPayroll
);

router.get(
  "/nonPayrollEmployee/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getNonPayrollEmployee
);
router.get(
  "/allEmployeePayroll/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getAllEmployeePayroll
);
router.get(
  "/payslip/:id",
  middleware.protectAll,
  middleware.restrictToAll("employee", "approver"),
  payroll.employeePaySlip
);

module.exports = router;
