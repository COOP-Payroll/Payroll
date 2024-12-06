const express = require("express");
const payroll = require("../controllers/payrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.post(
  "/par",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.createPayroll
);

router.get(
  "/nonPayrollEmployee/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getNonPayrollEmployee
);
router.get(
  "/allEmployeePayroll/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getAllEmployeePayroll
);
router.get(
  "/payslip/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("employee", "approver"),
  payroll.employeePaySlip
);

router.get(
  "/per-project/:projectId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getPayrollPerProject
);
router.get(
  "/:id",
  middleware.validateUserAgent,
  payroll.getAllPayrollByCompanyId
);
module.exports = router;
