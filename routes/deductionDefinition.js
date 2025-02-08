const express = require("express");
const deductionDefinition = require("../controllers/deductionDefintion");
const middleware = require("../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/deductiondefinition:
 *   get:
 *     summary: Retrieve all deduction definitions for the company
 *     description: Get a list of all deduction definitions associated with the company.
 *     tags:
 *       - Deduction Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the deduction definitions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 deductionDefinitions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the deduction definition.
 *                       name:
 *                         type: string
 *                         description: The name of the deduction.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   post:
 *     summary: Add a new deduction definition for the logged-in company
 *     description: Create a new deduction definition for the company that is currently logged in.
 *     tags:
 *       - Deduction Definitions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the deduction.
 *                 example: "Health Insurance"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully registered the new deduction definition.
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
 *                       description: The ID of the new deduction definition.
 *                     name:
 *                       type: string
 *                       description: The name of the new deduction.
 *       '400':
 *         description: Bad Request - Missing or invalid input.
 *       '404':
 *         description: Not Found - Deduction definition already exists or company not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//get all deduction of the same company
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  deductionDefinition.getAllDeductionDefinition
);
/**
 * @swagger
 * /api/deductiondefinition/{id}:
 *   get:
 *     summary: Get a deduction definition by its ID
 *     description: Retrieve the details of a specific deduction definition using its ID.
 *     tags:
 *       - Deduction Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the deduction definition to retrieve.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the deduction definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deductionDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the deduction definition.
 *                     name:
 *                       type: string
 *                       description: The name of the deduction definition.
 *       '404':
 *         description: Not Found - Deduction definition not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/deductiondefinition/{id}:
 *   put:
 *     summary: Update an existing deduction definition
 *     description: Update the details of an existing deduction definition based on its ID.
 *     tags:
 *       - Deduction Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the deduction definition to be updated.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the deduction.
 *                 example: "Retirement Savings"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated the deduction definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 deductionDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated deduction definition.
 *                     name:
 *                       type: string
 *                       description: The updated name of the deduction.
 *       '400':
 *         description: Bad Request - Missing or invalid input.
 *       '404':
 *         description: Not Found - Deduction definition not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   delete:
 *     summary: Delete a deduction definition by its ID
 *     description: Remove a deduction definition by specifying its ID.
 *     tags:
 *       - Deduction Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the deduction definition to be deleted.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the deduction definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '404':
 *         description: Not Found - Deduction definition not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//get deduction by id
router.get(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.getDeductionDefinitionById
);

//add new deduction for ompany who already lolgged in
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  deductionDefinition.createDeductionDefinition
);

//update by id
router.put(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.updateDeductionDefinition
);

//delete single deduction
router.delete(
  "/:id",
  middleware.validateUserAgent,
  deductionDefinition.deleteDeductionDefinition
);

module.exports = router;
