const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth");
const payroll = require("../controllers/payrollDefinition");
const PayrollDefinition = require("../models/payrollDefinition");

// Define routes for handling User requests

/**
 * @swagger
 * /api/payrolldefinition:
 *   get:
 *     summary: Retrieve all payroll definitions
 *     description: Fetches all payroll definitions for the current company.
 *     tags:
 *       - Payroll Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched payroll definitions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of payroll definitions retrieved.
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
 *                         description: Payroll definition ID.
 *                       payrollName:
 *                         type: string
 *                         description: Payroll name.
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll start date.
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll end date.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition/current-year:
 *   get:
 *     summary: Retrieve payroll definitions for the current year
 *     description: Fetches payroll definitions that are within the current year for the current company.
 *     tags:
 *       - Payroll Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched payroll definitions for the current year.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of payroll definitions retrieved for the current year.
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
 *                         description: Payroll definition ID.
 *                       payrollName:
 *                         type: string
 *                         description: Payroll name.
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll start date.
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll end date.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition/latest:
 *   get:
 *     summary: Retrieve the latest payroll definition
 *     description: Fetches the most recent payroll definition created.
 *     tags:
 *       - Payroll Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched the latest payroll definition.
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
 *                       description: Payroll definition ID.
 *                     payrollName:
 *                       type: string
 *                       description: Payroll name.
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: Payroll start date.
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       description: Payroll end date.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition:
 *   post:
 *     summary: Create a new payroll definition
 *     description: Creates a new payroll definition for the company.
 *     tags:
 *       - Payroll Definitions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 payrollName:
 *                   type: string
 *                   description: Payroll name.
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Payroll start date.
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Payroll end date.
 *                 status:
 *                   type: string
 *                   description: Payroll status (e.g., "active", "inactive").
 *     responses:
 *       '201':
 *         description: Successfully created the payroll definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                         description: Payroll definition ID.
 *                       payrollName:
 *                         type: string
 *                         description: Payroll name.
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll start date.
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll end date.
 *       '400':
 *         description: Bad Request - Invalid data or duplicate resource.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition/{id}:
 *   delete:
 *     summary: Delete a payroll definition by ID
 *     description: Deletes a payroll definition by its ID.
 *     tags:
 *       - Payroll Definitions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the payroll definition to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the payroll definition.
 *       '404':
 *         description: Not Found - Payroll definition not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition/{id}:
 *   put:
 *     summary: Update an existing payroll definition by ID
 *     description: Updates a payroll definition by its ID.
 *     tags:
 *       - Payroll Definitions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the payroll definition to update.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollName:
 *                 type: string
 *                 description: The name of the payroll definition.
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the payroll definition.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the payroll definition.
 *               status:
 *                 type: string
 *                 description: The status of the payroll (e.g., active or inactive).
 *     responses:
 *       '200':
 *         description: Successfully updated the payroll definition.
 *       '404':
 *         description: Not Found - Payroll definition not found with the given ID.
 *       '400':
 *         description: Bad Request - Invalid data or duplicate resource.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/payrolldefinition/currentMonth:
 *   get:
 *     summary: Retrieve payroll definitions for the current month
 *     description: Fetches payroll definitions for the current month.
 *     tags:
 *       - Payroll Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched payroll definitions for the current month.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                         description: Payroll definition ID.
 *                       payrollName:
 *                         type: string
 *                         description: Payroll name.
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll start date.
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: Payroll end date.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '404':
 *         description: Not Found - No payroll found for this month.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getAllPayroll
);

router.get(
  "/current-year",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getAllPayrollForCurrentYear
  // payroll.getPayrollBeforeCurrentMonth
);
router.get(
  "/latest",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getLatestPayroll
);

router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.createPayroll
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.deletePayrollDefinition
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.updatePayrollDefinition
);

router.get(
  "/currentMonth",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollsetup", isAccessible: true }),
  payroll.getCurrentMonth
);

module.exports = router;
