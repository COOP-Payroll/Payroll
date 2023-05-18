const express = require("express");
const deductionDefinition = require("../controllers/deductionDefintion");
const middleware = require('../middleware/auth')
const router = express.Router();
//get all deduction of the same company 
router.get("/", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
deductionDefinition.getAllDeductionDefinition);

//get deduction by id
router.get("/:id", 
deductionDefinition.getDeductionDefinitionById);

//add new deduction for ompany who already lolgged in
router.post("/", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
deductionDefinition.createDeductionDefinition);

//update by id
router.put("/:id", 
deductionDefinition.updateDeductionDefinition);

//delete single deduction
router.delete("/:id", 
deductionDefinition.deleteDeductionDefinition);

module.exports = router;
