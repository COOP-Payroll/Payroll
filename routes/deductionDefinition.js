const express = require("express");
const deductionDefinition = require("../controllers/deductionDefintion");
const middleware = require("../middleware/auth");
const router = express.Router();
//get all deduction of the same company
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  deductionDefinition.getAllDeductionDefinition
);

//get deduction by id
router.get(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.getDeductionDefinitionById
);

//add new deduction for ompany who already lolgged in
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  deductionDefinition.createDeductionDefinition
);

//update by id
router.put(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.updateDeductionDefinition
);

//delete single deduction
router.delete(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.deleteDeductionDefinition
);

module.exports = router;
