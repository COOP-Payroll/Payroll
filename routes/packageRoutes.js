const express = require("express");
const router = express.Router();

const packageController = require("../controllers/packageControllers.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests

/**
 * @swagger
 * components:
 *   parameters:
 *     AuthHeader:
 *       name: Authorization
 *       in: header
 *       description: Bearer token for authentication
 *       required: true
 *       schema:
 *         type: string
 *         format: "Bearer <token>"
 * 
 * /api/v1/packages:
 *   get:
 *     summary: Get a list of packages
 *     description: Endpoint to retrieve a list of packages.
 *     tags:
 *       - Packages

 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve packages.
 */
router.get(
  "/",
//   middleware.protectAll,
//   middleware.restrictToAdmin("superAdmin"),
  packageController.getAllPackages
);

/**
 * @swagger
 * /api/v1/packages/monthlyPackages:
 *   get:
 *     summary: Get monthly packages
 *     description: Endpoint to retrieve a list of yearly packages.
 *     tags:
 *       - Packages

 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of monthly packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve yearly packages.
 */


router.get("/monthlyPackages",
packageController.getMonthlyPackages
);

/**
 * @swagger
 * /api/v1/packages/yearlyPackages:
 *   get:
 *     summary: Get yearly packages
 *     description: Endpoint to retrieve a list of yearly packages.
 *     tags:
 *       - Packages

 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of yearly packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve yearly packages.
 */

router.get("/yearlyPackages",
packageController.getYearlyPackages
);


/**
 * @swagger
 * /api/v1/packages:
 *   post:
 *     summary: Create a new package
 *     description: Endpoint to create a new package.
 *     tags:
 *       - Packages
 *     parameters:
 *       - $ref: '#/components/parameters/AuthHeader'
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Package details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 enum: [Custom, Gold, Platinium]
 *                 description: The name of the package (Custom, Gold, or Platinium).
 *               packageType:
 *                 type: string
 *                 enum: [Yearly, Monthly]
 *                 description: The type of the package (Yearly or Monthly).
 *               price:
 *                 type: number
 *                 description: The price of the package.
 *               min_employee:
 *                 type: integer
 *                 description: The minimum number of employees for the package.
 *               max_employee:
 *                 type: integer
 *                 description: The maximum number of employees for the package.
 *               service:
 *                 type: array
 *                 items:
 *                   type: object 
 *                   description: Service details
 *                   properties:
 *                     serviceName:
 *                       type: string
 *                       description: The name of the service.
 *                 description: List of services included in the package.
 *               discount:
 *                 type: integer
 *                 description: The discount for the package.
 *               isTrial:
 *                 type: boolean
 *                 description: Indicates whether the package is a trial.
 *     responses:
 *       '201':
 *         description: Package successfully created.
 *       '400':
 *         description: Bad Request - Invalid input or missing required fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Package creation failed for some reason.
 */
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  packageController.createPackage
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  packageController.deletePackage
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  packageController.updatePackage
);
router.put("/:packageId/:serviceId",
middleware.restrictToAdmin("superAdmin"),
packageController.updateService
);
router.delete("/:packageId/:serviceId",
middleware.restrictToAdmin("superAdmin"),
packageController.deleteService
);
router.get(
  "/:id",
//   middleware.protectAll,
//   middleware.restrictToAdmin("superAdmin"),
  packageController.getpackageById
);

module.exports = router;
