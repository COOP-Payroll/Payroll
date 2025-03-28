/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdditionalDeductionDefinition:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the additional deduction definition.
 *         name:
 *           type: string
 *           description: The name of the additional deduction.
 *         amount:
 *           type: number
 *           format: float
 *           description: The monetary value of the additional deduction.
 *         CompanyId:
 *           type: integer
 *           description: The ID of the company associated with the deduction.
 *
 * /api/additionalDeductionDefinition:
 *   get:
 *     summary: Get all additional deductions for the authenticated company
 *     description: Fetches a list of all additional deductions that belong to the authenticated company.
 *     tags:
 *       - Additional Deductions Definition
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all additional deductions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The total number of deductions retrieved.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdditionalDeductionDefinition'
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalDeductionDefinition/{id}:
 *   get:
 *     summary: Get an additional deduction by ID
 *     description: Fetches a specific additional deduction by its unique identifier.
 *     tags:
 *       - Additional Deductions Definition
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the additional deduction to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the deduction.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalDeductionDefinition'
 *       '404':
 *         description: Resource not found - Deduction does not exist.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalDeductionDefinition:
 *   post:
 *     summary: Create a new additional deduction
 *     description: Registers a new additional deduction for a specific company.
 *     tags:
 *       - Additional Deductions Definition
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - isPercent
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the additional deduction.
 *               isPercent:
 *                 type: boolean
 *                 description: Indicates if the deduction is a percentage-based deduction.
 *     responses:
 *       '201':
 *         description: Successfully created a new additional deduction.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdditionalDeductionDefinition'
 *       '400':
 *         description: Bad Request - Invalid data or missing fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can create deductions.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalDeductionDefinition/{id}:
 *   put:
 *     summary: Update an existing additional deduction's amount
 *     description: Updates the amount of an additional deduction. Only company admins can perform this action.
 *     tags:
 *       - Additional Deductions Definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the additional deduction to update.
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
 *                 description: The new amount to update for the deduction.
 *     responses:
 *       '200':
 *         description: Successfully updated the deduction amount.
 *       '400':
 *         description: Bad Request - Invalid or missing fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can update deductions.
 *       '404':
 *         description: Not Found - The deduction with the specified ID was not found.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalDeductionDefinition/{id}:
 *   delete:
 *     summary: Delete an additionalDeductionDefinition
 *     description: Deletes an additionalDeductionDefinition by its unique identifier. Only company admins can perform this action.
 *     tags:
 *       - Additional Deductions Definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the additionalDeductionDefinition to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the allowance.
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
 *         description: Forbidden - Only company admins can delete allowances.
 *       '404':
 *         description: Not Found - The allowance with the specified ID was not found.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//////========================ADDITIONAL DEDUCTION==============================
/**
 * @swagger
 * /api/additionalDeduction:
 *   post:
 *     summary: Create a new additional deduction
 *     description: Assigns an additional deduction to an employee. Only company admins can perform this action.
 *     tags:
 *       - Additional Deductions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to be deducted.
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee receiving the deduction.
 *               AdditionalDeductionDefinitionId:
 *                 type: integer
 *                 description: The ID of the deduction definition.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully created the additional deduction.
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
 *                   description: The created additional deduction data.
 *       '400':
 *         description: Bad Request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can create deductions.
 *       '404':
 *         description: Not Found - Employee or deduction definition not found.
 *       '409':
 *         description: Conflict - Deduction already assigned to the employee.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *       '503':
 *         description: Service Unavailable - An error occurred, please try again later.
 */

/**
 * @swagger
 * /api/additionalDeduction:
 *   get:
 *     summary: Get all additional deductions
 *     description: Retrieves a list of all additional deductions.
 *     tags:
 *       - Additional Deductions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of additional deductions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the deduction.
 *                   name:
 *                     type: string
 *                     description: The name of the deduction.
 *                   amount:
 *                     type: number
 *                     description: The deducted amount.
 *                   isActive:
 *                     type: boolean
 *                     description: Deduction status.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/additionalDeduction/{id}:
 *   get:
 *     summary: Get an additional deduction by ID
 *     description: Retrieves an additional deduction by its unique identifier.
 *     tags:
 *       - Additional Deductions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the additional deduction to retrieve.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the additional deduction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the deduction.
 *                 name:
 *                   type: string
 *                   description: The name of the deduction.
 *                 amount:
 *                   type: number
 *                   description: The deducted amount.
 *                 isActive:
 *                   type: boolean
 *                   description: Deduction status.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '404':
 *         description: Not Found - Deduction with the specified ID not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

// /**
//  * @swagger
//  * /api/additionalDeduction/{id}:
//  *   put:
//  *     summary: Update an additional deduction
//  *     description: Updates an additional deduction by its unique identifier. Only company admins can perform this action.
//  *     tags:
//  *       - Additional Deductions
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The ID of the additional deduction to update.
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: The updated name of the additional deduction.
//  *               amount:
//  *                 type: number
//  *                 description: The updated deducted amount.
//  *               isActive:
//  *                 type: boolean
//  *                 description: Indicates whether the deduction is active.
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       '200':
//  *         description: Successfully updated the additional deduction.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                   description: The ID of the updated deduction.
//  *                 name:
//  *                   type: string
//  *                   description: The updated name of the deduction.
//  *                 amount:
//  *                   type: number
//  *                   description: The updated deducted amount.
//  *                 isActive:
//  *                   type: boolean
//  *                   description: Deduction status.
//  *       '400':
//  *         description: Bad Request - Invalid input data.
//  *       '401':
//  *         description: Unauthorized - Token is missing or invalid.
//  *       '403':
//  *         description: Forbidden - Only company admins can update deductions.
//  *       '404':
//  *         description: Not Found - Deduction with the specified ID not found.
//  *       '500':
//  *         description: Internal Server Error - Something went wrong on the server.
//  */

/**
 * @swagger
 * /api/additionalDeduction/{id}:
 *   delete:
 *     summary: Delete an additional deduction
 *     description: Deletes an additional deduction by its unique identifier. Only company admins can perform this action.
 *     tags:
 *       - Additional Deductions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the additional deduction to delete.
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the additional deduction.
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
 *         description: Forbidden - Only company admins can delete deductions.
 *       '404':
 *         description: Not Found - The deduction with the specified ID was not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalDeduction/{id}:
 *   put:
 *     summary: Copy and update an additional deduction
 *     description: Copies an existing additional deduction and updates its values. Only company admins can perform this action. The old deduction is marked as inactive, and a new one is created with the updated values.
 *     tags:
 *       - Additional Deductions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the additional deduction to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The updated deducted amount.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully copied and updated the additional deduction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created deduction.
 *                 amount:
 *                   type: number
 *                   description: The updated deducted amount.
 *                 isActive:
 *                   type: boolean
 *                   description: Deduction status (always `true` for the new deduction).
 *       '400':
 *         description: Bad Request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can update deductions.
 *       '404':
 *         description: Not Found - Deduction with the specified ID not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */



//=========================================================================///