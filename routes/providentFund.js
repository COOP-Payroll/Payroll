const express = require("express");
const router = express.Router();
const providentController = require("../controllers/providentFund.js");
const middleware = require("../middleware/auth.js");

/**
 * @swagger
 * /api/providentFund:
 *   get:
 *     summary: Get all provident funds
 *     description: Fetches all provident funds for the logged-in user based on their role (`superAdmin` or `companyAdmin`).
 *     tags:
 *       - Provident Fund
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched the provident funds.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of provident funds fetched.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The provident fund record ID.
 *                       employerContribution:
 *                         type: number
 *                         format: float
 *                         description: The employer's contribution.
 *                       employeeContribution:
 *                         type: number
 *                         format: float
 *                         description: The employee's contribution.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/providentFund:
 *   post:
 *     summary: Create a new provident fund
 *     description: Creates a new provident fund for the logged-in user or company admin.
 *     tags:
 *       - Provident Fund
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerContribution:
 *                 type: number
 *                 format: float
 *                 description: The employer's contribution.
 *               employeeContribution:
 *                 type: number
 *                 format: float
 *                 description: The employee's contribution.
 *     responses:
 *       '200':
 *         description: Successfully created the provident fund.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the provident fund was successfully created.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The provident fund record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The employer's contribution.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The employee's contribution.
 *       '400':
 *         description: Bad Request - Invalid provident fund data provided.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/providentFund/{id}:
 *   put:
 *     summary: Update a provident fund record by ID
 *     description: Updates a provident fund record based on the provided ID. Only `superAdmin` and `companyAdmin` can perform the update.
 *     tags:
 *       - Provident Fund
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the provident fund record to update.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerContribution:
 *                 type: number
 *                 format: float
 *                 description: The updated employer's contribution.
 *               employeeContribution:
 *                 type: number
 *                 format: float
 *                 description: The updated employee's contribution.
 *     responses:
 *       '200':
 *         description: Successfully updated the provident fund record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the provident fund was successfully updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The provident fund record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employer's contribution.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employee's contribution.
 *       '400':
 *         description: Bad Request - Invalid provident fund data provided or provident fund not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/providentFund/{id}:
 *   delete:
 *     summary: Delete a provident fund record by ID
 *     description: Deletes a specific provident fund record based on the provided ID. Only `superAdmin` and `companyAdmin` can delete a provident fund.
 *     tags:
 *       - Provident Fund
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the provident fund record to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the provident fund record.
 *       '400':
 *         description: Bad Request - No provident fund record found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/providentFund/{id}/restore-to-default:
 *   put:
 *     summary: Restore the provident fund to its default state
 *     description: Restores the provident fund to its default state with `0` contributions for both employer and employee.
 *     tags:
 *       - Provident Fund
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the provident fund record to restore.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully restored the provident fund to its default state.
 *       '400':
 *         description: Bad Request - The provident fund record not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.getAllProvidentFund
);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.createProvidentFund
);

router.put(
  "/:restore-to-default",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.restoreToDefault
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.updateProvidentFund
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.deleteProvidentFund
);

// router.get("/:id", providentController.getpensionById);

module.exports = router;
