const express = require("express");
const approvalMethod = require("../controllers/approvalMethod");
const middleware = require("../middleware/auth");
const router = express.Router();
//get all approval method of this company
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ApprovalMethod:
 *       type: object
 *       required:
 *         - approvalMethod
 *       properties:
 *         approvalMethod:
 *           type: string
 *           enum: [hierarchy, horizontal]
 *           description: Defines the type of approval method.
 *           example: "hierarchy"
 *         approvalLevel:
 *           type: integer
 *           description: Required if approvalMethod is 'hierarchy'.
 *           example: 3
 *         minimumApprover:
 *           type: integer
 *           description: Required if approvalMethod is 'horizontal'.
 *           example: 2
 *         isThereMasterApprover:
 *           type: boolean
 *           description: Indicates whether there is a master approver.
 *           example: false
 *
 * /api/approvalmethod:
 *   post:
 *     summary: Create an approval method
 *     description: Set the approval method for a company. Only one approval method can be active per company.
 *     tags:
 *       - Approval Methods
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalMethod'
 *     responses:
 *       '200':
 *         description: Approval method created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "approval method created successfully"
 *       '400':
 *         description: Bad Request - Invalid input or approval method already exists.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions.
 *       '503':
 *         description: Service Unavailable - Error while processing the request.
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
 * /api/approvalmethod:
 *   get:
 *     summary: Retrieve all approval methods
 *     description: Get all approval methods for the authenticated company.
 *     tags:
 *       - Approval Methods
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved approval methods.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The number of approval methods returned.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the approval method.
 *                       name:
 *                         type: string
 *                         description: The name of the approval method.
 *                       CompanyId:
 *                         type: integer
 *                         description: The ID of the company associated with this method.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have access to this resource.
 *       '503':
 *         description: Service Unavailable - An error occurred while retrieving the data.
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ReCreateApprovalMethod:
 *       type: object
 *       required:
 *         - approvalMethod
 *       properties:
 *         approvalMethod:
 *           type: string
 *           enum: [hierarchy, horizontal]
 *           description: The type of approval method.
 *           example: "hierarchy"
 *         approvalLevel:
 *           type: integer
 *           description: Required if approvalMethod is 'hierarchy'.
 *           example: 3
 *         minimumApprover:
 *           type: integer
 *           description: Required if approvalMethod is 'horizontal'.
 *           example: 2
 *         isThereMasterApprover:
 *           type: boolean
 *           description: Indicates whether there is a master approver.
 *           example: false
 *
 * /api/approvalmethod/recreate:
 *   post:
 *     summary: Recreate an approval method
 *     description: Recreates the approval method for a company. This will deactivate the existing approval method and create a new one.
 *     tags:
 *       - Approval Methods
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReCreateApprovalMethod'
 *     responses:
 *       '200':
 *         description: Approval method recreated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Recreated successfully"
 *       '400':
 *         description: Bad Request - Invalid input or no previous approval method found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions.
 *       '503':
 *         description: Service Unavailable - Error while processing the request.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.getAllApprovalMethod
);

router.get(
  "/active",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.getAllActiveApprovalMethod
);

//get only inactive
router.get(
  "/inactive",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.getAllInActiveApprovalMethod
);

//add new approval
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.createApprovalMethod
);

//add additional  approval method
router.post(
  "/recreate",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.reCreateApprovalMethod
);

//update single approval method
router.put(
  "/:id",
  middleware.validateUserAgent,
  approvalMethod.updateApprovalMethod
);

//delete single approval method
router.delete(
  "/:id",
  middleware.validateUserAgent,
  approvalMethod.deleteApprovalMethod
);

module.exports = router;
