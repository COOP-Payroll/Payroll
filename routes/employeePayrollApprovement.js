const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth");
const employeePayrollApprovementController = require("../controllers/employeePayrollApprovement");

// GET /employee-payroll-approvements
router.get(
  "/",
  middleware.restrictTo("approver"),
  employeePayrollApprovementController.getAllApprovements
);

// GET /employee-payroll-approvements/:id by definition id
router.get("/:id", employeePayrollApprovementController.getApprovementById);

// GET /employee-payroll-approvements/:id by payroll id
router.get(
  "/employeeApprovement/:id",

  middleware.validateUserAgent,
  employeePayrollApprovementController.getApprovementByPayrollId
);
// POST /employee-payroll-approvements
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("approver", "companyAdmin"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.createApprovement
);
//aprove by array
router.post(
  "/approve",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("approver"),
  // middleware.restrictALL({
  //   moduleName: "PayrollPublishedReport",
  //   isAccessible: true,
  // }),
  employeePayrollApprovementController.approveStatusOfPayroll
  // employeePayrollApprovementController.arrayApprove2Approvement
);

// PUT /employee-payroll-approvements/:id
router.put(
  "/:id",
  middleware.validateUserAgent,
  employeePayrollApprovementController.updateApprovement
);

// DELETE /employee-payroll-approvements/:id
router.delete(
  "/:id",
  middleware.validateUserAgent,
  employeePayrollApprovementController.deleteApprovement
);

//reject
router.post(
  "/reject",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.rejectPayroll
);

module.exports = router;
