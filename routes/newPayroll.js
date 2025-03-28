const express = require("express");
const payroll = require("../controllers/newPayrollController");
const payroll1 = require("../controllers/payrollController.js");
const middleware = require("../middleware/auth");
const router = express.Router();
const z = require("../controllers/zcontrollers.js");
/**
 * @swagger
 * /api/newPayroll/download-template:
 *   get:
 *     summary: Download Employee Template
 *     description: Generates and downloads an Excel template for employee data.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully downloaded employee template.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '403':
 *         description: Forbidden - User does not have access.
 *       '500':
 *         description: Internal server error.
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
 *           enum: ["approved", "rejected", "pending"]
 *           example: "approved"
 *         isPaid:
 *           type: boolean
 *           example: false
 *         processId:
 *           type: integer
 *           example: 12345
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
 * /api/newPayroll/get-approved-payrolls:
 *   get:
 *     summary: Retrieve approved payrolls for the current month (Company Admin Only)
 *     description: Fetches a list of approved payrolls for employees, processed for the current month, for the specified company.
 *                  **Note:** This endpoint is only accessible to users with the **companyAdmin** role.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved approved payrolls
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
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "123"
 *         fullname:
 *           type: string
 *           example: "John Doe"
 *         positionName:
 *           type: string
 *           example: "Software Engineer"
 *         image:
 *           type: string
 *           format: uri
 *           example: "https://example.com/profile.jpg"
 *         sex:
 *           type: string
 *           example: "Male"
 *         date_of_birth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         role:
 *           type: string
 *           example: "Developer"
 *         nationality:
 *           type: string
 *           example: "American"
 *         marriageStatus:
 *           type: string
 *           example: "Single"
 *         employee_id_number:
 *           type: string
 *           example: "EMP12345"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "+1234567890"
 *         optionalNumber:
 *           type: string
 *           example: "+0987654321"
 *         id_image:
 *           type: string
 *           format: uri
 *           example: "https://example.com/id.jpg"
 *         id_type:
 *           type: string
 *           example: "Passport"
 *         grossSalary:
 *           type: number
 *           example: 5000
 *         basicSalary:
 *           type: number
 *           example: 3000
 *         taxableIncome:
 *           type: number
 *           example: 4000
 *         incomeTax:
 *           type: number
 *           example: 500
 *         totalDeduction:
 *           type: number
 *           example: 700
 *         totalAllowance:
 *           type: number
 *           example: 1200
 *         NetSalary:
 *           type: number
 *           example: 4300
 *         employee_pension_amount:
 *           type: number
 *           example: 200
 *         employer_pension_amount:
 *           type: number
 *           example: 300
 *         status:
 *           type: string
 *           example: "unprocessed"
 *         isPaid:
 *           type: boolean
 *           example: false
 *
 * /api/newPayroll/get-unprocessed-payrolls/{id}:
 *   get:
 *     summary: Get Unprocessed Payrolls for a Specific Month
 *     description: Retrieve a list of employees with unprocessed payrolls for a specific month.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the payroll definition.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved unprocessed payrolls.
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
 *       '404':
 *         description: Payroll definition not found.
 *       '503':
 *         description: Service unavailable.
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
 *           description: The unique identifier of the payroll.
 *         PayrollDefinitionId:
 *           type: integer
 *           description: The ID of the associated payroll definition.
 *         CompanyId:
 *           type: integer
 *           description: The ID of the company.
 *         status:
 *           type: string
 *           enum: [processed, pending]
 *           description: The current status of the payroll.
 *         Employee:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The unique identifier of the employee.
 *             fullname:
 *               type: string
 *               description: The full name of the employee.
 *
 * /api/newPayroll/payroll-draft:
 *   get:
 *     summary: Get payroll draft for the current month
 *     description: Fetches payroll drafts within the current month for the authenticated company.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         description: The page number for pagination (default is 1).
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         description: The number of records per page (default is 10).
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved payroll drafts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payroll'
 *       '204':
 *         description: No payrolls defined for this month.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
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
 *   schemas:
 *     PayrollCreationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The success message of the payroll creation.
 *         error:
 *           type: array
 *           items:
 *             type: string
 *           description: List of error messages, if any.
 *     PayrollRequest:
 *       type: object
 *       required:
 *         - payrollDefinitionId
 *         - employeeIds
 *       properties:
 *         payrollDefinitionId:
 *           type: integer
 *           description: The ID of the payroll definition.
 *           example: 123
 *         employeeIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: A list of employee IDs for which payroll will be created.
 *           example: [1, 2, 3]
 * /api/newPayroll:
 *   post:
 *     summary: Create payroll for employees
 *     description: Creates payroll records for the provided list of employees based on the payroll definition.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayrollRequest'
 *     responses:
 *       '201':
 *         description: Successfully created payroll.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollCreationResponse'
 *       '400':
 *         description: Bad Request - Payroll has already been run for one or more employees, or employees not fully assigned projects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Some employees have not been fully assigned projects. Please ensure all employees are assigned projects totaling 100%."
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [1, 2]
 *       '404':
 *         description: Not Found - Payroll definition or employees not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "payroll is not defined"
 *       '503':
 *         description: Service Unavailable - Error occurred while creating payroll.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "There is a problem creating payroll."
 *       '500':
 *         description: Internal Server Error - Unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred while creating payroll."
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
 *     PayrollRevertResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The success message of the payroll revert.
 *         error:
 *           type: array
 *           items:
 *             type: string
 *           description: List of error messages, if any.
 *     PayrollRevertRequest:
 *       type: object
 *       required:
 *         - payrollDefinitionId
 *         - employeeIds
 *       properties:
 *         payrollDefinitionId:
 *           type: integer
 *           description: The ID of the payroll definition to be reverted.
 *           example: 123
 *         employeeIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: A list of employee IDs for whom the payroll will be reverted.
 *           example: [1, 2, 3]
 * /api/newPayroll/revert-employees:
 *   post:
 *     summary: Revert payroll for selected employees
 *     description: Reverts the payroll records for the provided list of employees, only if the status is not 'APPROVED'.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayrollRevertRequest'
 *     responses:
 *       '200':
 *         description: Successfully reverted payroll.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollRevertResponse'
 *       '400':
 *         description: Bad Request - No payroll records found for the provided employee(s) that can be reverted. The payroll status may be 'APPROVED'.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No payroll records found for the provided employee(s) that can be reverted. Please ensure the payroll status is not 'APPROVED'."
 *       '404':
 *         description: Not Found - Payroll definition or employees not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payroll definition not found or some employees do not exist."
 *       '503':
 *         description: Service Unavailable - Error occurred while reverting payroll.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing payroll revert."
 *       '500':
 *         description: Internal Server Error - Unexpected error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error occurred while reverting payroll."
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
 *     PayrollPaymentProcessRequest:
 *       type: object
 *       required:
 *         - processIds
 *       properties:
 *         processIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: A list of payroll process IDs to be processed.
 *           example: [1, 2, 3]
 *     PayrollPaymentProcessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The success message of the payroll payment process.
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The unique identifier of the payment transaction.
 *               status:
 *                 type: string
 *                 description: The status of the transaction.
 *               message:
 *                 type: string
 *                 description: A message related to the transaction.
 *               transactionId:
 *                 type: string
 *                 description: The unique identifier for the transaction.
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A description of the error.
 *         error:
 *           type: string
 *           description: A specific error message.
 * /api/newPayroll/paymentProcess:
 *   post:
 *     summary: Process payroll payments
 *     description: Processes payroll payments for the provided process IDs.
 *     tags:
 *       - Payroll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayrollPaymentProcessRequest'
 *     responses:
 *       '200':
 *         description: Payroll payments processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollPaymentProcessResponse'
 *       '400':
 *         description: Invalid or empty process IDs, or some payrolls not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the necessary permissions.
 *       '503':
 *         description: Internal Server Error - Payment processing failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal Server Error - An unexpected error occurred during processing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get(
  "/get-approved-payrolls",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  payroll.getApprovedPay
);

router.get(
  "/download-template",
  // middleware.protectAll,
  // middleware.restrictToAll("companyAdmin"),
  payroll.downloadEmployeeTemplate
);
router.get(
  "/available-payrolls",
  middleware.protectAll,
  middleware.restrictToAll("approver"),
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
  "/paymentProcess",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin", "approver"),
  payroll.getPayrollPaymentProcess
);
router.post(
  "/revert-employees",
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
