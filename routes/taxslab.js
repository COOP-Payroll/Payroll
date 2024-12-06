const express = require("express");
const router = express.Router();
const taxslabController = require("../controllers/taxslab.js");

const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.getAllTaxslabs
);

router.get(
  "/tax/:id",
  middleware.validateUserAgent,
  taxslabController.getCompanyWITHtAXSLAB
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.createTaxslab
);
router.delete(
  "/:id",
  middleware.validateUserAgent,
  taxslabController.deleteTaxslab
);
router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateTaxslab
);

router.put(
  "/updateMany/tax",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateMany
);

//RESTORE TO DEFAULT

router.put(
  "/restoreTodefault/tax",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.restoreToDefault
);

router.get(
  "/:id",
  middleware.validateUserAgent,
  taxslabController.getTaxslabById
);

module.exports = router;
