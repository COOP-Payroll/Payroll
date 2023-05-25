const express = require("express");
const allowanceDefinition = require("../controllers/additionalAllowanceDefinition.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();
//get allowance defined by this company
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowanceDefinition.getAllAdditionalAllowanceDefinition
);

//get allowance by its id
// router.get("/:id", allowanceDefinition.getAllowanceDefinitionById);

//allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowanceDefinition.createAdditionalAllowanceDefinition
);

//update allowance definition
router.put(
  "/update/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowanceDefinition.updateAdditionalAllowanceDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowanceDefinition.deleteAdditionalAllowanceDefinition
);

module.exports = router;
