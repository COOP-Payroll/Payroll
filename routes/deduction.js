const express = require("express");
const deduction = require("../controllers/deduction");

const router = express.Router();
const middleware = require("../middleware/auth.js");
/**
 * @swagger
 * /api/deduction:
 *   get:
 *     summary: Retrieve all deductions for the current company
 *     description: This endpoint retrieves all deductions associated with the current authenticated user's company.
 *     tags:
 *       - Deductions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all deductions for the company.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The total number of deductions found.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier for the deduction.
 *                       name:
 *                         type: string
 *                         description: The name of the deduction.
 *                       amount:
 *                         type: number
 *                         format: float
 *                         description: The amount of the deduction.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the deduction was created.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the deduction was last updated.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/deduction/{id}:
 *   get:
 *     summary: Retrieve a deduction by its ID
 *     description: This endpoint retrieves a deduction for the current company by its unique identifier (ID).
 *     tags:
 *       - Deductions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the deduction to be retrieved.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the deduction by ID.
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
 *                       description: The unique identifier for the deduction.
 *                     name:
 *                       type: string
 *                       description: The name of the deduction.
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: The amount of the deduction.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the deduction was created.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the deduction was last updated.
 *       '404':
 *         description: Deduction not found - The deduction with the provided ID does not exist.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/deduction:
 *   post:
 *     summary: Create a new deduction
 *     description: This endpoint creates a new deduction with the specified amount, grade, and deduction definition.
 *     tags:
 *       - Deductions
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
 *                 description: The amount to be deducted.
 *               gradeId:
 *                 type: integer
 *                 description: The unique identifier of the grade to which the deduction belongs.
 *               deductinDefinitionId:
 *                 type: integer
 *                 description: The unique identifier of the deduction definition.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully created the deduction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating successful creation.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier for the deduction.
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: The amount of the deduction.
 *                     gradeId:
 *                       type: integer
 *                       description: The grade ID to which the deduction is linked.
 *                     deductinDefinitionId:
 *                       type: integer
 *                       description: The deduction definition ID for the deduction.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the deduction was created.
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp when the deduction was last updated.
 *       '400':
 *         description: Bad Request - Missing or invalid input parameters.
 *       '404':
 *         description: Not Found - Grade or Deduction Definition not found.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/deduction/{id}:
 *   put:
 *     summary: Update deduction amount
 *     description: Updates only the amount of an existing deduction.
 *     tags:
 *       - Deductions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the deduction to update.
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
 *                 description: The new amount for the deduction.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated the deduction amount.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message.
 *       '400':
 *         description: Bad Request - Invalid input.
 *       '404':
 *         description: Not Found - Deduction not found.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.getAllDeduction
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.getDeductionById
);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.createDeduction
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.updateDeduction
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.deleteDeduction
);

module.exports = router;
