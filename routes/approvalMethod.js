const express = require("express");
const approvalMethod = require("../controllers/approvalMethod")
const middleware= require('../middleware/auth')
const router = express.Router();
//get all approval method of this company 
router.get("/", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approvalMethod.getAllApprovalMethod);

//get only active 
router.get("/active", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approvalMethod.getAllActiveApprovalMethod);


//get only inactive 
router.get("/inactive", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approvalMethod.getAllInActiveApprovalMethod);

//add new approval 
router.post("/", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approvalMethod.createApprovalMethod);  

//add additional  approval method 
router.post("/recreate", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
approvalMethod.reCreateApprovalMethod);  

//update single approval method
router.put("/:id", 
approvalMethod.updateApprovalMethod)

//delete single approval method
router.delete("/:id",approvalMethod.deleteApprovalMethod)

module.exports = router;