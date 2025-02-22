const express = require("express");
const payroll = require("../controllers/newPayrollController");
const payroll1 = require("../controllers/payrollController.js");
const middleware = require("../middleware/auth");
const router = express.Router();
const z = require("../controllers/zcontrollers.js");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     NonPayrollEmployee:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Employee ID
 *           example: "12345"
 *         fullname:
 *           type: string
 *           description: Full name of the employee
 *           example: "John Doe"
 *         email:
 *           type: string
 *           description: Email address of the employee
 *           example: "john.doe@example.com"
 *         phoneNumber:
 *           type: string
 *           description: Primary phone number
 *           example: "+123456789"
 *         optionalNumber:
 *           type: string
 *           description: Optional phone number
 *           example: "+987654321"
 *         sex:
 *           type: string
 *           description: Gender of the employee
 *           example: "Male"
 *         nationality:
 *           type: string
 *           description: Nationality of the employee
 *           example: "American"
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Date the employee was hired
 *           example: "2023-01-15"
 *         isActive:
 *           type: boolean
 *           description: Whether the employee is currently active
 *           example: true
 *         grossEarning:
 *           type: number
 *           format: float
 *           description: Employee's gross earning
 *           example: 5000.00
 *         totalDeductions:
 *           type: number
 *           format: float
 *           description: Total deductions applied to the employee
 *           example: 200.00
 *         totalAllowances:
 *           type: number
 *           format: float
 *           description: Total allowances for the employee
 *           example: 300.00
 *         totalLoan:
 *           type: number
 *           format: float
 *           description: Total loan amount
 *           example: 1500.00
 *         employerContribution:
 *           type: number
 *           format: float
 *           description: Employer's pension contribution
 *           example: 250.00
 *
 * /api/newPayroll/nonPayrollEmployee/{id}:
 *   get:
 *     summary: Get non-payroll employees
 *     description: Fetches employees who are not included in a payroll definition.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll definition ID
 *     responses:
 *       '200':
 *         description: Successfully retrieved non-payroll employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NonPayrollEmployee'
 *       '400':
 *         description: Bad Request - Invalid parameters
 *       '401':
 *         description: Unauthorized - Token missing or invalid
 *       '403':
 *         description: Forbidden - User lacks necessary permissions
 *       '404':
 *         description: Not Found - Payroll definition not found
 *       '503':
 *         description: Service Unavailable - Error processing the request
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
 *     Payroll:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "January Payroll"
 *         period:
 *           type: string
 *           example: "2024-01"
 *         status:
 *           type: string
 *           enum: ["open", "closed", "processing"]
 *           example: "open"
 *         grossSalary:
 *           type: number
 *           format: float
 *           example: 5000
 *         basicSalary:
 *           type: number
 *           format: float
 *           example: 3000
 *         taxableIncome:
 *           type: number
 *           format: float
 *           example: 2000
 *         incomeTax:
 *           type: number
 *           format: float
 *           example: 200
 *         totalDeduction:
 *           type: number
 *           format: float
 *           example: 300
 *         totalAllowance:
 *           type: number
 *           format: float
 *           example: 150
 *         NetSalary:
 *           type: number
 *           format: float
 *           example: 4500
 *         employee_pension_amount:
 *           type: number
 *           format: float
 *           example: 100
 *         employer_pension_amount:
 *           type: number
 *           format: float
 *           example: 200
 *         isPaid:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-02-22T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-02-22T12:00:00Z"
 *     Approver:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "John Doe"
 *         role:
 *           type: string
 *           enum: ["companyAdmin", "approver"]
 *           example: "approver"
 *
 * /api/newPayroll/available-payrolls:
 *   get:
 *     summary: Retrieve available payrolls that are not approved (Approvers Only)
 *     description: Fetches a list of payrolls that are not approved for the current month, excluding those already approved by the current approver.
 *                  **Note:** This endpoint is only accessible to users with the **Approver** role.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved not approved payrolls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Available payrolls fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payroll'
 *       '400':
 *         description: Bad request - Missing or incorrect data
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *       '403':
 *         description: Forbidden - User does not have access
 *       '404':
 *         description: No payrolls found for this month
 *       '500':
 *         description: Internal server error
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
 *     Payroll:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         grossSalary:
 *           type: number
 *           format: float
 *           example: 5000
 *         basicSalary:
 *           type: number
 *           format: float
 *           example: 3000
 *         taxableIncome:
 *           type: number
 *           format: float
 *           example: 2000
 *         incomeTax:
 *           type: number
 *           format: float
 *           example: 200
 *         totalDeduction:
 *           type: number
 *           format: float
 *           example: 300
 *         totalAllowance:
 *           type: number
 *           format: float
 *           example: 150
 *         NetSalary:
 *           type: number
 *           format: float
 *           example: 4500
 *         employee_pension_amount:
 *           type: number
 *           format: float
 *           example: 100
 *         employer_pension_amount:
 *           type: number
 *           format: float
 *           example: 200
 *         status:
 *           type: string
 *           enum: ["open", "closed", "processing"]
 *           example: "closed"
 *         isPaid:
 *           type: boolean
 *           example: false
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         fullname:
 *           type: string
 *           example: "John Doe"
 *         role:
 *           type: string
 *           example: "employee"
 *         positionName:
 *           type: string
 *           example: "Software Engineer"
 *         nationality:
 *           type: string
 *           example: "Kenyan"
 *         maritalStatus:
 *           type: string
 *           example: "Single"
 *         email:
 *           type: string
 *           example: "johndoe@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "+254700123456"
 *         idImage:
 *           type: string
 *           format: uri
 *           example: "http://example.com/image.jpg"
 *         payrollInfo:
 *           $ref: '#/components/schemas/Payroll'
 * /api/newPayroll/get-processed-payrolls:
 *   get:
 *     summary: Retrieve processed payrolls for the current month (Company Admin Only)
 *     description: Fetches a list of payrolls for employees, processed for the current month, for the specified company.
 *                  **Note:** This endpoint is only accessible to users with the **companyAdmin** role.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved processed payrolls
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "true"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       '204':
 *         description: No payrolls defined for this month
 *       '400':
 *         description: Bad request - Missing or incorrect data
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *       '403':
 *         description: Forbidden - User does not have access
 *       '500':
 *         description: Internal server error
 */

router.get(
  "/available-payrolls",
  middleware.protectAll,
  // middleware.restrictToAll("approver"),
  payroll.getNotApprovedPayroll
);

router.get(
  "/get-processed-payrolls",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  payroll.getProcessedPayroll
);

router.get(
  "/get-unprocessed-payrolls/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  payroll.getUnprocessedPayrollForSpecificMonthProcessedPayroll
);

router.get(
  "/payroll-draft",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll1.payrollDraft1
);
router.get(
  "/payrolldraft",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll1.payrollDraft
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictApprover({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payroll.getPayrollByPayrollDefId
);

router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.createPayroll1
);

router.post(
  "/project-based",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.projectBasedPayroll
);
router.post(
  "/deselect",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.deselectRunnedPayroll
);

router.get(
  "/getAllEmployee/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll1.getAllEmployeePayroll
);
router.get(
  "/nonPayrollEmployee/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getNonPayrollEmployee1
);
// router.get(
//   "/allEmployeePayroll/:id",
//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin", "approver"),
//   payroll1.getAllEmployeePayroll
// );

//UPDATE
router.put(
  "/update/:payrollId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "payrollpublish", isAccessible: true }),
  payroll.updatePayrollData
);

// router.get(
//   "/",
//   middleware.protectAll,
//   middleware.restrictTo("companyAdmin"),
//   payroll.getActivePayroll
// );
// router.get("/nonPayrollEmployee/:id", payroll.getNonPayrollEmployee);
// router.get("/allEmployeePayroll/:id", payroll.getAllEmployeePayroll);
module.exports = router;
