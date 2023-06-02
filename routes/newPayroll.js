const express = require("express");
const payroll = require("../controllers/newPayrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.getPayrollByPayrollDefId
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.createPayroll
);

router.get(
  "/getAllEmployee/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.getNonPayrollEmployee
);
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
