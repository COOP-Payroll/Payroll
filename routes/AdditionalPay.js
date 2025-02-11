const express = require("express");
const additionalPay = require("../controllers/additionalPay.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

/**
 * @swagger
 * /api/additionalpay:
 *   get:
 *     summary: Get all Additional Pay records
 *     description: Fetches all the additional pay records for the company of the logged-in user.
 *     tags:
 *       - Additional Pay
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched additional pay records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of additional pay records
 *                 message:
 *                   type: string
 *                   example: "Data fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/AdditionalPay'
 *       '503':
 *         description: An error occurred, please try again later
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '403':
 *         description: Forbidden - User does not have necessary permissions
 *
 *   post:
 *     summary: Create an additional pay record
 *     description: Creates a new additional pay record for an employee in the company.
 *     tags:
 *       - Additional Pay
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
 *                 description: The amount of additional pay
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee receiving the pay
 *               additionalPayDefinitionId:
 *                 type: integer
 *                 description: The ID of the additional pay definition
 *               payrollDefinitionId:
 *                 type: integer
 *                 description: The ID of the payroll definition
 *     responses:
 *       '200':
 *         description: Successfully created the additional pay record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 data:
 *                   $ref: '#/definitions/AdditionalPay'
 *       '400':
 *         description: Invalid input - Missing or incorrect parameters
 *       '404':
 *         description: Employee or resource not found
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server
 *

 *
 */

/**
 * @swagger
 * definitions:
 *   AdditionalPay:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *         description: The unique ID of the additional pay record
 *       amount:
 *         type: number
 *         description: The amount of additional pay
 *       createdAt:
 *         type: string
 *         format: date-time
 *         description: The creation date of the additional pay record
 *       updatedAt:
 *         type: string
 *         format: date-time
 *         description: The last update date of the additional pay record
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  additionalPay.getAllAdditionalPay
);
// router.get(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.getAllowanceById
// );

router.post(
  "/",

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionalPay.createAdditionalPay
);

// router.put(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.updateAllowance
// );
// router.delete(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   allowance.deleteAllowance
// );

module.exports = router;
