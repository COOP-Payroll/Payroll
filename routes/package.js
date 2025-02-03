const express = require("express");
const router = express.Router();

const packageController = require("../controllers/package.js");
const middleware = require("../middleware/auth.js");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * /api/package:
 *   get:
 *     summary: Get all packages
 *     description: Retrieve a list of all available packages.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *   post:
 *     summary: Create a new package
 *     description: Create a new package with the provided details.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 example: "Gold"
 *               packageType:
 *                 type: string
 *                 example: "Monthly"
 *               max_employee:
 *                 type: integer
 *                 example: 500
 *               min_employee:
 *                 type: integer
 *                 example: 0
 *               price:
 *                 type: number
 *                 example: 50
 *               service:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "payroll service"
 *               discount:
 *                 type: number
 *                 example: 0
 *     responses:
 *       '200':
 *         description: Successfully created the package.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully Registered"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     packageName:
 *                       type: string
 *                       example: "Gold"
 *                     packageType:
 *                       type: string
 *                       example: "Monthly"
 *                     max_employee:
 *                       type: integer
 *                       example: 500
 *                     min_employee:
 *                       type: integer
 *                       example: 0
 *                     price:
 *                       type: number
 *                       example: 50
 *                     service:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "payroll service"
 *                     discount:
 *                       type: number
 *                       example: 0
 *       '400':
 *         description: Bad request - Invalid data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *
 * /api/package/trial:
 *   get:
 *     summary: Get trial package
 *     description: Retrieve a trial package.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved trial package.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Package not found.
 *
 * /api/package/monthlyPackages:
 *   get:
 *     summary: Get monthly packages
 *     description: Retrieve a list of all monthly packages.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved monthly packages.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 
 * /api/package/yearlyPackages:
 *   get:
 *     summary: Get yearly packages
 *     description: Retrieve a list of all yearly packages.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved yearly packages.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 *
 * 
 
 * /api/packages/{id}:
 *   get:
 *     summary: Get a package by ID
 *     description: Retrieve the details of a specific package by its ID.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Package ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved package.
 *       '404':
 *         description: Package not found.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 *
 *   put:
 *     summary: Update a package
 *     description: Update the details of a specific package by its ID.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Package ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 example: "Gold Updated"
 *               packageType:
 *                 type: string
 *                 example: "Yearly"
 *               max_employee:
 *                 type: integer
 *                 example: 500
 *               min_employee:
 *                 type: integer
 *                 example: 0
 *               price:
 *                 type: number
 *                 example: 60
 *               service:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "new payroll service"
 *               discount:
 *                 type: number
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Successfully updated the package.
 *       '404':
 *         description: Package not found.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 *
 *   delete:
 *     summary: Delete a package
 *     description: Delete a specific package by its ID.
 *     tags:
 *       - Package
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Package ID
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: Successfully deleted the package.
 *       '404':
 *         description: Package not found.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal Server Error.
 */

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
