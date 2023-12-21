const express = require("express");
const payroll = require("../controllers/newPayrollController");
const payroll1=require("../controllers/payrollController.js")
const middleware = require("../middleware/auth");
const router = express.Router();
const z=require("../controllers/zcontrollers.js")

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictApprover({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payroll.getPayrollByPayrollDefId
);


router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.createPayroll1
);

router.post(
  "/deselect",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.deselectRunnedPayroll
);

router.get(
  "/getAllEmployee/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll1.getAllEmployeePayroll
);
router.get(
  "/nonPayrollEmployee/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getNonPayrollEmployee1
);
// router.get(
//   "/allEmployeePayroll/:id",
//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin", "approver"),
//   payroll1.getAllEmployeePayroll
// );

//UPDATE
router.put(
  "/update/:payrollId",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.updatePayrollData
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
