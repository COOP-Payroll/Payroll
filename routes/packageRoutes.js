const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageControllers.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests

// /**
//  * @swagger
//  * components:
//  *   parameters:
//  *     AuthHeader:
//  *       name: Authorization
//  *       in: header
//  *       description: Bearer token for authentication
//  *       required: true
//  *       schema:
//  *         type: string
//  *         format: "Bearer <token>"
//  * 
//  * /api/v1/packages:
//  *   get:
//  *     summary: Get a list of packages
//  *     description: Endpoint to retrieve a list of packages.
//  *     tags:
//  *       - Packages

//  *     responses:
//  *       '200':
//  *         description: Successfully retrieved the list of packages.
//  *       '401':
//  *         description: Unauthorized - Token is missing or invalid.
//  *       '500':
//  *         description: Internal Server Error - Failed to retrieve packages.
//  */
router.get(
  "/",
  middleware.validateUserAgent,
  //   middleware.protectAll,
  //   middleware.restrictToAdmin("superAdmin"),
  packageController.getAllPackages
);
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
  middleware.restrictToAdmin("superAdmin"),
  packageController.createPackageWithServie
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
router.put(
  "/:packageId/:serviceId",
  middleware.validateUserAgent,
  middleware.restrictToAdmin("superAdmin"),
  packageController.updateService
);
router.delete(
  "/:packageId/:serviceId",
  middleware.validateUserAgent,
  middleware.restrictToAdmin("superAdmin"),
  packageController.deleteService
);
router.get(
  "/:id",
  middleware.validateUserAgent,
  //   middleware.protectAll,
  //   middleware.restrictToAdmin("superAdmin"),
  packageController.getpackageById
);

module.exports = router;
