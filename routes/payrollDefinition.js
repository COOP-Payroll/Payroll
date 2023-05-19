const express = require('express');
const router = express.Router();
const middleware = require('../middleware/auth')
const payroll=require('../controllers/payrollDefinition')

// Define routes for handling User requests
router.get('/', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
payroll.getAllPayroll);


router.post('/',
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
payroll.createPayroll);

router.delete('/:id', payroll.deletePayrollDefinition);

router.put('/:id', payroll.updatePayrollDefinition);

//router.get('/:id',)


module.exports = router;
