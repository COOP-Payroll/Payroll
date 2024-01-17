const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth')
const payroll=require('../controllers/payrollDefinition');
const PayrollDefinition = require('../models/payrollDefinition');

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getAllPayroll
);
router.get(
  "/latest",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getLatestPayroll
);


router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.createPayroll
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.deletePayrollDefinition
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.updatePayrollDefinition
);

router.get(
  "/currentMonth",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getCurrentMonth
);


module.exports = router;
