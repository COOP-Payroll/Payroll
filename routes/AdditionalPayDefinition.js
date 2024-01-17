const express = require("express");
const additionPayDefinition = require("../controllers/AdditionalPayDefinition.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();
//get allowance defined by this company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.getAdditionalPayDefinitionById
);

router.get(
    "/",
    middleware.protectAll,
    middleware.restrictTo("companyAdmin"),
    additionPayDefinition.getAllAdditionalPayDefinition
  );


//allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.createAdditionalPayDefinition
);

// update allowance definition
router.put(
  "/update/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.updateAdditionalPayDefinition
);

// //delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.deleteAdditionalPayDefinition
);

module.exports = router;
