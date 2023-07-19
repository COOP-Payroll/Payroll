const express = require('express');
const router = express.Router();
const approverController = require('../controllers/approver');
const middleware = require('../middleware/auth')

// GET /approvers - Get all Approvers
router.get('/', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getAllApprovers);

//get all active approver
router.get('/active', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getAllActiveApprovers);

//get all active approver
router.get('/inactive', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getAllInActiveApprovers);

 // GET /approvers/:id - Get a single Approver by ID
router.get('/:id',
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getApproverById);

//approver by employee 
router.get('/employeeId/:id',
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getApproverByEmployeeId);

//deactive approver  
router.put('/deactive', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.deactiveApprover);

 // POST /approvers - Create a new Approver
 router.post(
   "/",
   middleware.protectAll,
   middleware.restrictTo("companyAdmin"),
   approverController.createApprover
 );


//  PUT /approvers/:id - Update an existing Approver
router.put('/:id', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.updateApprover);

// // DELETE /approvers/:id - Delete an Approver
router.delete('/:id',
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.deleteApprover);

module.exports = router;
