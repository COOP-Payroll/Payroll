const express = require("express");
const allowanceDefinition = require("../controllers/allowanceDefinition");
const middleware=require('../middleware/auth')
const router = express.Router();
//get allowance defined by this company
router.get("/", 
middleware.protectAll,
middleware.restrictToAll('companyAdmin'),
allowanceDefinition.getAllAllowanceDefinition);

//get allowance by its id 
router.get("/:id", 
allowanceDefinition.getAllowanceDefinitionById);

//allowance definition for this company 
router.post("/", 
middleware.protectAll,
middleware.restrictToAll('companyAdmin'),
allowanceDefinition.createAllowanceDefinition);

//update allowance definition
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.updateAllowanceDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.deleteAllowanceDefinition
);

module.exports = router;