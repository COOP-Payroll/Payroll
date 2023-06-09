const express = require('express');
const router = express.Router();
const approverController = require('../controllers/approver');
const middleware = require('../middleware/auth')

// GET /approvers - Get all Approvers
router.get('/', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getAllApprovers);



router.get('/active', 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approverController.getAllActiveApprovers);
// // GET /approvers/:id - Get a single Approver by ID
router.get('/:id', approverController.getApproverById);

//approver by employee 
router.get('/employeeId/:id', approverController.getApproverByEmployeeId);

//deactive approver  
router.put('/:id', approverController.deactiveApprover);
 // POST /approvers - Create a new Approver
 router.post(
   "/",
   middleware.protectAll,
   middleware.restrictTo("companyAdmin"),
   approverController.createApprover
 );

 router.post(
  "/deActive",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  approverController.createApprover
);
// // PUT /approvers/:id - Update an existing Approver
router.put('/:id', approverController.updateApprover);

// // DELETE /approvers/:id - Delete an Approver
router.delete('/:id', approverController.deleteApprover);

module.exports = router;
