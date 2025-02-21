const express = require("express");
const companyIdRouter = require("../controllers/companyIdFormat");
const middleware = require("../middleware/auth");

const router = express.Router();
// const companyIdController = require("../controllers/companyIdFormat");
// const middleware = require("../middleware/auth");

// const router = express.Router();

router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  companyIdRouter.createCompanyIdFormat
);

router.get(
  "/",
  middleware.validateUserAgent,
  // middleware.protectAll,
  companyIdRouter.getAllCompanyIdFormat
);
// router.get("/:id", companyController.getCompanyById);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/companyIdFormat:
 *   put:
 *     summary: Update company ID format
 *     description: Update the format for the company ID, including fields like company code, year, department, order, separator, and digit length.
 *     tags:
 *       - Company ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: boolean
 *                 description: The year value (true/false) to be used in the company ID format.
 *               department:
 *                 type: boolean
 *                 description: The department value (true/false) to be used in the company ID format.
 *               order:
 *                 type: string
 *                 description: The order of the components in the company ID (e.g., companyCode, department, year).
 *               separator:
 *                 type: string
 *                 description: The separator used between the components (e.g., "-", "/").
 *               digitLength:
 *                 type: integer
 *                 description: The length of the final ID.
 *             required:
 *               - year
 *               - department
 *               - order
 *               - separator
 *               - digitLength
 *           example:
 *             year: true
 *             department: false
 *             separator: "-"
 *             digitLength: 4
 *             order: "companyCode,department,year"
 *     responses:
 *       '200':
 *         description: Successfully updated company ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the ID format has been updated.
 *                 data:
 *                   type: object
 *                   description: The updated company ID format object.
 *       '400':
 *         description: Bad Request - Missing or invalid parameters.
 *       '404':
 *         description: Not Found - Company or active company ID format not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to update the company ID format.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.put(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  companyIdRouter.updateCompanyIdFormat
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  companyIdRouter.deleteCompanyIdFormat
);

/**
 * @swagger
 * /api/companyIdFormat/activeIdFormat:
 *   get:
 *     summary: Get active company ID format
 *     description: Retrieve the active company ID format for the authenticated user.
 *     tags:
 *       - Company ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved active company ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   description: The active company ID format object.
 *       '404':
 *         description: Not Found - No active company ID format found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access this resource.
 *       '503':
 *         description: Service Unavailable - Server error occurred.
 */
router.get(
  "/activeIdFormat",
  middleware.protectAll,
  middleware.validateUserAgent,
  // middleware.restrictToAll("companyAdmin"),
  companyIdRouter.getActiveCompany
);

module.exports = router;

//
