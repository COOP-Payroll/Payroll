const express = require("express");
const payroll = require("../controllers/newPayrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin","approver"),
  payroll.getPayrollByPayrollDefId
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.createPayroll
);

router.get(
  "/getAllEmployee/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getNonPayrollEmployee
);

router.put(
  "/update/:payrollId",
  middleware.protectAll,
<<<<<<< HEAD
  middleware.restrictTo("companyAdmin"),
=======
  middleware.restrictToAll("companyAdmin", "approver"),
>>>>>>> a4d081f819f514c9a9230842e91494a824f149e8
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
