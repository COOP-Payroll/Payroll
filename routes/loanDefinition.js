const express = require("express");

const loanDefinition = require("../controllers/loanDefinition.js");
const middleware = require("../middleware/auth");
const router = express.Router();
//get allowance defined by this company

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/loanDefinition:
 *   post:
 *     summary: Create a new loan definition
 *     description: Create a new loan definition for the company.
 *     tags:
 *       - Loan Definitions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the loan definition.

 *     responses:
 *       '200':
 *         description: Successfully created the loan definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 loanDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the loan definition.
 *                     name:
 *                       type: string
 *                       description: The name of the loan definition.
 *       '400':
 *         description: Bad Request - Loan definition already exists.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   get:
 *     summary: Get all loan definitions
 *     description: Retrieve all loan definitions for the company.
 *     tags:
 *       - Loan Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the loan definitions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the loan definition.
 *                   name:
 *                     type: string
 *                     description: The name of the loan definition.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to view the loan definitions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  loanDefinition.getAllLoanDefinition
);

// //get allowance by its id
// router.get("/:id", allowanceDefinition.getAllowanceDefinitionById);

// //allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  loanDefinition.createLoanDefinition
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/loanDefinition/{id}:
 *   put:
 *     summary: Update an existing loan definition
 *     description: Update the details of an existing loan definition.
 *     tags:
 *       - Loan Definitions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the loan definition to update.
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
 *                 description: The name of the loan definition.
 *               isTaxable:
 *                 type: boolean
 *                 description: Indicates if the loan is taxable.
 *               isExempted:
 *                 type: boolean
 *                 description: Indicates if the loan is exempted.
 *               exemptedAmount:
 *                 type: number
 *                 format: float
 *                 description: The exempted amount for the loan.
 *               startingAmount:
 *                 type: number
 *                 format: float
 *                 description: The starting amount for the loan.
 *     responses:
 *       '200':
 *         description: Successfully updated the loan definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 loanDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated loan definition.
 *                     name:
 *                       type: string
 *                       description: The name of the loan definition.
 *       '400':
 *         description: Bad Request - Invalid or missing data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to update the loan definition.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   delete:
 *     summary: Delete an existing loan definition
 *     description: Delete a specific loan definition by its ID.
 *     tags:
 *       - Loan Definitions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the loan definition to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully deleted the loan definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '400':
 *         description: Bad Request - Invalid loan definition ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to delete the loan definition.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//update allowance definition
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  loanDefinition.updateLoanDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  loanDefinition.deleteLoanDefinition
);

module.exports = router;
