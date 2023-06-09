const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth')
const payroll=require('../controllers/payrollDefinition')

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

//router.get('/:id',)


module.exports = router;
