const express = require("express");
const router = express.Router();

const packageController = require("../controllers/package.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.validateUserAgent,
  //   middleware.protectAll,
  //   middleware.restrictToAdmin("superAdmin"),
  packageController.getAllPackages
);

router.get("/trial", middleware.validateUserAgent, packageController.getTrial);

router.get(
  "/monthlyPackages",
  middleware.validateUserAgent,
  packageController.getMonthlyPackages
);

router.get(
  "/yearlyPackages",
  middleware.validateUserAgent,
  packageController.getYearlyPackages
);

router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAdmin("superAdmin"),
  packageController.createPackage
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAdmin("superAdmin"),
  packageController.deletePackage
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAdmin("superAdmin"),
  packageController.updatePackage
);
router.get(
  "/:id",
  middleware.validateUserAgent,
  //   middleware.protectAll,
  //   middleware.restrictToAdmin("superAdmin"),
  packageController.getpackageById
);

module.exports = router;
