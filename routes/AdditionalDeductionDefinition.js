const express = require("express");
const AdditionalDeductionDefinition = require("../controllers/additionalDeductionDefinition.js");
const middleware = require("../middleware/auth");
const router = express.Router();
//get allowance defined by this company
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  AdditionalDeductionDefinition.getAllAdditionalDeductionDefinition
);

// //get allowance by its id
// router.get("/:id", allowanceDefinition.getAllowanceDefinitionById);

// //allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  AdditionalDeductionDefinition.createAdditionalDeductionDefinition
);

//update allowance definition
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  AdditionalDeductionDefinition.updateAdditionalDeductionDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  AdditionalDeductionDefinition.deleteAdditionalDeductionDefinition
);

module.exports = router;
