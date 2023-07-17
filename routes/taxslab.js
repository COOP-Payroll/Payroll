const express = require("express");
const router = express.Router();
const taxslabController = require("../controllers/taxslab.js");

const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.getAllTaxslabs
);

router.get("/tax/:id", taxslabController.getCompanyWITHtAXSLAB);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.createTaxslab
);
router.delete("/:id", taxslabController.deleteTaxslab);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateTaxslab
);

router.put(
  "/updateMany/tax",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateMany
);

//RESTORE TO DEFAULT

router.put(
  "/restoreTodefault/tax",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.restoreToDefault
);

router.get("/:id", taxslabController.getTaxslabById);

module.exports = router;
