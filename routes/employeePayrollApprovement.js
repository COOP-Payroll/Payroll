const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth");
const employeePayrollApprovementController = require("../controllers/employeePayrollApprovement");


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/employeePayrollApprovement/approve:
 *   post:
 *     summary: Approve payrolls
 *     description: Approve multiple payrolls with the approver's approval. The approver can approve payrolls based on approval method.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: The list of payroll IDs to approve.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Payrolls:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   description: The IDs of the payrolls to approve.
 *             example:
 *               Payrolls: [85, 86, 87, 88, 89, 90]
 *     responses:
 *       '200':
 *         description: Successfully approved the payrolls.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '400':
 *         description: Bad Request - Invalid payroll IDs or duplicate approval.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to approve payrolls.
 *       '404':
 *         description: Not Found - Payrolls not found or approver not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

// GET /employee-payroll-approvements
router.get(
  "/",
  middleware.restrictTo("approver"),
  employeePayrollApprovementController.getAllApprovements
);

// GET /employee-payroll-approvements/:id by definition id
router.get("/:id", employeePayrollApprovementController.getApprovementById);

// GET /employee-payroll-approvements/:id by payroll id
router.get(
  "/employeeApprovement/:id",

  middleware.validateUserAgent,
  employeePayrollApprovementController.getApprovementByPayrollId
);
// POST /employee-payroll-approvements
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("approver", "companyAdmin"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.createApprovement
);
//aprove by array
router.post(
  "/approve",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("approver"),
  // middleware.restrictALL({
  //   moduleName: "PayrollPublishedReport",
  //   isAccessible: true,
  // }),
  employeePayrollApprovementController.approveStatusOfPayroll1
  // employeePayrollApprovementController.arrayApprove2Approvement
);

// PUT /employee-payroll-approvements/:id
router.put(
  "/:id",
  middleware.validateUserAgent,
  employeePayrollApprovementController.updateApprovement
);

// DELETE /employee-payroll-approvements/:id
router.delete(
  "/:id",
  middleware.validateUserAgent,
  employeePayrollApprovementController.deleteApprovement
);

//reject
router.post(
  "/reject",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  employeePayrollApprovementController.rejectPayroll
);

module.exports = router;
