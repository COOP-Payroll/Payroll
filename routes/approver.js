const express = require("express");
const router = express.Router();
const approverController = require("../controllers/approver");
const middleware = require("../middleware/auth");
/**
 * @swagger
 * /api/approver:
 *   post:
 *     summary: Create a new approver
 *     description: Add a new approver for the authenticated company.
 *     tags:
 *       - Approvers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: integer
 *                 description: Level of the approver.
 *                 example: 1
 *               role:
 *                 type: string
 *                 description: Role of the approver.
 *                 example: "Hr"
 
 *               isMaster:
 *                 type: boolean
 *                 description: Whether the approver is a master approver.
 *                 example: false
 *               EmployeeId:
 *                 type: integer
 *                 description: ID of the employee.
 *                 example: 2
 *     responses:
 *       '201':
 *         description: Approver created successfully.
 *       '400':
 *         description: Bad Request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access this resource.
 *       '500':
 *         description: Internal Server Error - Failed to create approver.
 */

/**
 * @swagger
 * /api/approver/active:
 *   get:
 *     summary: Get all active approvers
 *     description: Retrieve all active approvers for the authenticated company admin.
 *     tags:
 *       - Approvers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved active approvers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of active approvers.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   description: List of active approvers.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Approver ID.
 *                       CompanyId:
 *                         type: integer
 *                         description: ID of the company.
 *                       isActive:
 *                         type: boolean
 *                         description: Status of the approver.
 *                       Employee:
 *                         type: object
 *                         properties:
 *                           fullname:
 *                             type: string
 *                             description: Full name of the employee.
 *       '404':
 *         description: Not Found - No active approvers found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access this resource.
 *       '503':
 *         description: Service Unavailable - Server error occurred.
 */
// GET /approvers - Get all Approvers
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.getAllApprovers
);

//get all active approver
router.get(
  "/active",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.getAllActiveApprovers
);

//get all active approver
router.get(
  "/inactive",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.getAllInActiveApprovers
);

// GET /approvers/:id - Get a single Approver by ID
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.getApproverById
);

//approver by employee
router.get(
  "/employeeId/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.getApproverByEmployeeId
);

//deactive approver
router.put(
  "/deactive",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.deactiveApprover
);

// POST /approvers - Create a new Approver
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.createApprover
);

//  PUT /approvers/:id - Update an existing Approver
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.updateApprover
);

// // DELETE /approvers/:id - Delete an Approver
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approverController.deleteApprover
);

module.exports = router;
