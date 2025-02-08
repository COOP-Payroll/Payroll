const express = require("express");
const allowanceDefinition = require("../controllers/allowanceDefinition");
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
 * /api/allowancedefinition:
 *   get:
 *     summary: Retrieve all allowance definitions
 *     description: Get all the allowance definitions for the company.
 *     tags:
 *       - Allowance Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved allowance definitions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 allowanceDefinitions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the allowance definition.
 *                       name:
 *                         type: string
 *                         description: The name of the allowance.
 *                       isTaxable:
 *                         type: boolean
 *                         description: Whether the allowance is taxable.
 *                       isExempted:
 *                         type: boolean
 *                         description: Whether the allowance is exempted.
 *                       exemptedAmount:
 *                         type: number
 *                         format: float
 *                         description: The exempted amount of the allowance.
 *                       startingAmount:
 *                         type: number
 *                         format: float
 *                         description: The starting amount of the allowance.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have access to this resource.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   post:
 *     summary: Create a new allowance definition
 *     description: Create a new allowance definition for the company.
 *     tags:
 *       - Allowance Definitions
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
 *                 description: The name of the allowance.
 *               isTaxable:
 *                 type: boolean
 *                 description: Whether the allowance is taxable.
 *               isExempted:
 *                 type: boolean
 *                 description: Whether the allowance is exempted.
 *               exemptedAmount:
 *                 type: number
 *                 format: float
 *                 description: The exempted amount for the allowance (optional).
 *               startingAmount:
 *                 type: number
 *                 format: float
 *                 description: The starting amount for the allowance.
 *     responses:
 *       '200':
 *         description: Successfully created the allowance definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 allowanceDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created allowance definition.
 *                     name:
 *                       type: string
 *                       description: The name of the allowance.
 *                     isTaxable:
 *                       type: boolean
 *                       description: Whether the allowance is taxable.
 *                     isExempted:
 *                       type: boolean
 *                       description: Whether the allowance is exempted.
 *                     exemptedAmount:
 *                       type: number
 *                       format: float
 *                       description: The exempted amount for the allowance.
 *                     startingAmount:
 *                       type: number
 *                       format: float
 *                       description: The starting amount for the allowance.
 *       '400':
 *         description: Bad Request - Invalid or missing data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions (companyAdmin).
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
 * /api/allowancedefinition/{id}:
 *   get:
 *     summary: Retrieve a specific allowance definition by its ID
 *     description: Get a single allowance definition based on its ID for the company.
 *     tags:
 *       - Allowance Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the allowance definition.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the allowance definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 allowanceDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the allowance definition.
 *                     name:
 *                       type: string
 *                       description: The name of the allowance.
 *                     isTaxable:
 *                       type: boolean
 *                       description: Whether the allowance is taxable.
 *                     isExempted:
 *                       type: boolean
 *                       description: Whether the allowance is exempted.
 *                     exemptedAmount:
 *                       type: number
 *                       format: float
 *                       description: The exempted amount for the allowance.
 *                     startingAmount:
 *                       type: number
 *                       format: float
 *                       description: The starting amount for the allowance.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have access to this resource.
 *       '404':
 *         description: Not Found - The allowance definition does not exist.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   put:
 *     summary: Update a specific allowance definition by its ID
 *     description: Update a single allowance definition based on its ID.
 *     tags:
 *       - Allowance Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the allowance definition to update.
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
 *                 description: The name of the allowance.
 *               isTaxable:
 *                 type: boolean
 *                 description: Whether the allowance is taxable.
 *               isExempted:
 *                 type: boolean
 *                 description: Whether the allowance is exempted.
 *               exemptedAmount:
 *                 type: number
 *                 format: float
 *                 description: The exempted amount for the allowance (optional).
 *               startingAmount:
 *                 type: number
 *                 format: float
 *                 description: The starting amount for the allowance.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated the allowance definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 allowanceDefinition:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the updated allowance definition.
 *                     name:
 *                       type: string
 *                       description: The name of the allowance.
 *                     isTaxable:
 *                       type: boolean
 *                       description: Whether the allowance is taxable.
 *                     isExempted:
 *                       type: boolean
 *                       description: Whether the allowance is exempted.
 *                     exemptedAmount:
 *                       type: number
 *                       format: float
 *                       description: The exempted amount for the allowance.
 *                     startingAmount:
 *                       type: number
 *                       format: float
 *                       description: The starting amount for the allowance.
 *       '400':
 *         description: Bad Request - Invalid or missing data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '404':
 *         description: Not Found - The allowance definition does not exist.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   delete:
 *     summary: Delete a specific allowance definition by its ID
 *     description: Delete a single allowance definition based on its ID.
 *     tags:
 *       - Allowance Definitions
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the allowance definition to delete.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the allowance definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (companyAdmin).
 *       '404':
 *         description: Not Found - The allowance definition does not exist.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.getAllAllowanceDefinition
);

//get allowance by its id
router.get(
  "/:id",
  middleware.validateUserAgent,
  allowanceDefinition.getAllowanceDefinitionById
);

//allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.createAllowanceDefinition
);

//update allowance definition
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.updateAllowanceDefinition
);

//delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  allowanceDefinition.deleteAllowanceDefinition
);

module.exports = router;
