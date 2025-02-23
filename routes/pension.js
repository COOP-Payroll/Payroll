const express = require("express");
const router = express.Router();
const pensionController = require("../controllers/pension.js");
const middleware = require("../middleware/auth.js");
/**
 * @swagger
 * /api/pension:
 *   get:
 *     summary: Fetch all active pensions for a user
 *     description: Fetches a list of active pensions for the user based on their role (superAdmin or companyAdmin).
 *     tags:
 *       - Pensions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched all active pensions for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: The total number of active pensions for the user.
 *                 pensions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The pension ID.
 *                       employerContribution:
 *                         type: number
 *                         format: float
 *                         description: The employer contribution amount.
 *                       employeeContribution:
 *                         type: number
 *                         format: float
 *                         description: The employee contribution amount.
 *                       isActive:
 *                         type: boolean
 *                         description: Indicates if the pension is active.
 *       '400':
 *         description: Bad Request - Invalid input or no pensions found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/pension:
 *   post:
 *     summary: Create a new pension record for a user
 *     description: Creates a pension record for the user (superAdmin or companyAdmin). If a pension is already defined for the user or company, an update is required.
 *     tags:
 *       - Pensions
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
 *                 description: The employer's contribution to the pension.
 *                 example: 200.00
 *               employeeContribution:
 *                 type: number
 *                 format: float
 *                 description: The employee's contribution to the pension.
 *                 example: 100.00
 *     responses:
 *       '200':
 *         description: Successfully created the pension record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the pension was successfully registered.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The pension record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The employer's contribution.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The employee's contribution.
 *                     CompanyId:
 *                       type: integer
 *                       description: The company ID to which the pension is associated.
 *       '400':
 *         description: Bad Request - Pension already defined for the user or company.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/pension/{id}:
 *   put:
 *     summary: Update a pension record by ID
 *     description: Updates a specific pension record based on the provided ID. Only `superAdmin` and `companyAdmin` can perform the update.
 *     tags:
 *       - Pensions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the pension record to update.
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
 *         description: Successfully updated the pension record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the pension was successfully updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The pension record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employer's contribution.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employee's contribution.
 *       '400':
 *         description: Bad Request - Invalid pension data provided or pension not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/pension/{id}:
 *   delete:
 *     summary: Delete a pension record by ID
 *     description: Deletes a pension record identified by the ID. Only `superAdmin` and `companyAdmin` can delete a pension record.
 *     tags:
 *       - Pensions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the pension record to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the pension record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the pension record was successfully deleted.
 *       '400':
 *         description: Bad Request - Invalid pension ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/pension/{id}:
 *   put:
 *     summary: Update a pension record by ID
 *     description: Updates a specific pension record based on the provided ID. Only `superAdmin` and `companyAdmin` can perform the update.
 *     tags:
 *       - Pensions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the pension record to update.
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
 *         description: Successfully updated the pension record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the pension was successfully updated.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The pension record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employer's contribution.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The updated employee's contribution.
 *       '400':
 *         description: Bad Request - Invalid pension data provided or pension not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/pension/restore-to-default:
 *   put:
 *     summary: Restore the pension settings to default
 *     description: Resets the pension data for the company, deactivates the current pension record, and creates a default one with zero contributions. Only `superAdmin` and `companyAdmin` can restore to default.
 *     tags:
 *       - Pensions
 *     parameters:
 *       - in: path
 *         name: restore-to-default
 *         required: true
 *         description: Special endpoint to reset pension settings.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully restored pension settings to default.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the operation was successful.
 *                 message:
 *                   type: string
 *                   description: Success message indicating that the pension was restored to default.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The new pension record ID.
 *                     employerContribution:
 *                       type: number
 *                       format: float
 *                       description: The employer's contribution after restore.
 *                     employeeContribution:
 *                       type: number
 *                       format: float
 *                       description: The employee's contribution after restore.
 *       '400':
 *         description: Bad Request - Invalid pension data or request.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  pensionController.getAllPension
);

router.get(
  "/all",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  pensionController.getAllPensionIncludingInActive
);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  pensionController.createPension
);
// router.put("/")

router.put(
  "/:restore-to-default",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),

  pensionController.restoreToDefault
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),

  pensionController.updatePension
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin", "companyAdmin"),

  pensionController.deletePension
);

router.get(
  "/:id",
  middleware.validateUserAgent,
  pensionController.getpensionById
);

module.exports = router;
