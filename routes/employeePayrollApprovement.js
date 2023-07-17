const express = require("express");
const router = express.Router();
const middleware = require('../middleware/auth')
const employeePayrollApprovementController = require("../controllers/employeePayrollApprovement");

// GET /employee-payroll-approvements
router.get("/", employeePayrollApprovementController.getAllApprovements);

// GET /employee-payroll-approvements/:id
router.get("/:id", employeePayrollApprovementController.getApprovementById);

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


  

// PUT /employee-payroll-approvements/:id
router.put("/:id", employeePayrollApprovementController.updateApprovement);

// DELETE /employee-payroll-approvements/:id
router.delete("/:id", employeePayrollApprovementController.deleteApprovement);

module.exports = router;
