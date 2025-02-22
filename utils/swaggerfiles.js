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
 * /api/get-processed-payrolls:
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
