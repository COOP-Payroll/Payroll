const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const middleware = require("../middleware/auth.js");
const taxslabController = require("../controllers/taxslab.js");
const providentController = require("../controllers/providentFund.js");
const pensionController = require("../controllers/pension.js");

router.post(
  "/CompanyStatus/update",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),

  userController.updateCompanyStatus1
);

router.post(
  "/restoreTodefault/tax",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.restoreToDefault
);

router.post(
  "/:restore-to-default",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.restoreToDefault
);
router.post(
  "/:restore-to-default",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),

  pensionController.restoreToDefault
);

module.exports = router;