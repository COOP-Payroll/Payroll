const express = require("express");

const loanDefinition=require('../controllers/loanDefinition.js')
const middleware = require("../middleware/auth");
const router = express.Router();
//get allowance defined by this company
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  loanDefinition.getAllLoanDefinition
);

// //get allowance by its id
// router.get("/:id", allowanceDefinition.getAllowanceDefinitionById);

// //allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
 loanDefinition.createLoanDefinition
);

//update allowance definition
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
loanDefinition.updateLoanDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
loanDefinition.deleteLoanDefinition
);

module.exports = router;
