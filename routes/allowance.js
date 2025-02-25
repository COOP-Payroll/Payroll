const express = require("express");
const allowance = require("../controllers/allowance");
const middleware = require("../middleware/auth.js");
const router = express.Router();
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Allowance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the allowance.
 *         name:
 *           type: string
 *           description: The name of the allowance.
 *         amount:
 *           type: number
 *           format: float
 *           description: The monetary value of the allowance.
 *         CompanyId:
 *           type: integer
 *           description: The ID of the company associated with the allowance.
 *
 * /api/allowance:
 *   get:
 *     summary: Get all allowances for the authenticated company
 *     description: Fetches a list of all allowances that belong to the authenticated company.
 *     tags:
 *       - Allowances
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all allowances.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The total number of allowances retrieved.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Allowance'
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/allowance/{id}:
 *   get:
 *     summary: Get an allowance by ID
 *     description: Fetches a specific allowance by its unique identifier.
 *     tags:
 *       - Allowances
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the allowance to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the allowance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier of the allowance.
 *                     name:
 *                       type: string
 *                       description: The name of the allowance.
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: The monetary value of the allowance.
 *                     CompanyId:
 *                       type: integer
 *                       description: The ID of the company associated with the allowance.
 *       '404':
 *         description: Resource not found - Allowance does not exist.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/allowance:
 *   post:
 *     summary: Create a new allowance
 *     description: Registers a new allowance for a specific grade and allowance definition.
 *     tags:
 *       - Allowances
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The amount of the allowance.
 *               gradeId:
 *                 type: integer
 *                 description: The grade ID to associate the allowance with.
 *               allowanceDefinitionId:
 *                 type: integer
 *                 description: The allowance definition ID to associate the allowance with.
 *     responses:
 *       '200':
 *         description: Successfully created a new allowance.
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
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique ID of the newly created allowance.
 *                     amount:
 *                       type: string
 *                       description: The amount of the allowance.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the allowance was created.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the allowance was last updated.
 *                     AllowanceDefinitionId:
 *                       type: integer
 *                       description: The ID of the associated allowance definition.
 *                     GradeId:
 *                       type: integer
 *                       description: The ID of the associated grade.
 *                     CompanyId:
 *                       type: integer
 *                       description: The ID of the associated company.
 *       '400':
 *         description: Bad Request - Invalid data or missing fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can create allowances.
 *       '404':
 *         description: Not Found - Grade or allowance definition not found.
 *       '409':
 *         description: Conflict - Allowance definition already exists for the grade.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/allowance/{id}:
 *   put:
 *     summary: Update an existing allowance's amount
 *     description: Updates the amount of an allowance for a specific grade and allowance definition. Only company admins can perform this action.
 *     tags:
 *       - Allowances
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the allowance to update.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The new amount to update for the allowance.
 *     responses:
 *       '200':
 *         description: Successfully updated the allowance amount.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '400':
 *         description: Bad Request - Invalid or missing fields (e.g., invalid amount).
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can update allowances.
 *       '404':
 *         description: Not Found - The allowance with the specified ID was not found.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.getAllAllowance
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.getAllowanceById
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.createAllowance
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.updateAllowance
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.deleteAllowance
);

module.exports = router;
