const express = require('express');
const router = express.Router();

const payroll=require('../controllers/payrollDefinition')

// Define routes for handling User requests
router.get('/:companyId', payroll.getAllPayroll);
router.post('/:companyId', payroll.createPayroll);
// router.delete('/:id',);
// router.put('/:id',);
// router.get('/:id',)


module.exports = router;
