const express = require('express');
const router = express.Router();
const payrollApprovement = require('../controllers/payrollApprovement');
const middleware = require("../middleware/auth")

router.post('/', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
payrollApprovement.createPayrollApprovement);

router.get('/', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
payrollApprovement.getAllPayrollApprovements);

router.get('/:id', 
payrollApprovement.getPayrollApprovementById);

router.put('/:id', 
payrollApprovement.updatePayrollApprovement);

router.delete('/:id', 
payrollApprovement.deletePayrollApprovement);

module.exports = router;
