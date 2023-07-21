const express = require("express");
const router = express.Router();
const middleware = require('../middleware/auth')
const employeePayrollApprovementController = require("../controllers/employeePayrollApprovement");

// GET /employee-payroll-approvements
router.get("/", employeePayrollApprovementController.getAllApprovements);

// GET /employee-payroll-approvements/:id by definition id
router.get("/:id", employeePayrollApprovementController.getApprovementById);

// GET /employee-payroll-approvements/:id by payroll id
router.get("/employeeApprovement/:id", employeePayrollApprovementController.getApprovementByPayrollId);
// POST /employee-payroll-approvements
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
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
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.arrayApproveApprovement
);

  

// PUT /employee-payroll-approvements/:id
router.put("/:id", employeePayrollApprovementController.updateApprovement);

// DELETE /employee-payroll-approvements/:id
router.delete("/:id", employeePayrollApprovementController.deleteApprovement);


//reject 
router.post(
  "/reject",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.rejectPayroll
);


module.exports = router;
