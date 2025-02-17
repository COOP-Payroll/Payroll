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

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  approvalMethod.getAllApprovalMethod
);

//get
//get only active
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
