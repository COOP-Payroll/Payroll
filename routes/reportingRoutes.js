const express = require("express");
const middleware = require("../middleware/auth");
const router = express.Router();
const reportController = require("../controllers/reportingControllers.js");

/**
 * @swagger
 * /api/reports/payroll-published-report:
 *   get:
 *     summary: Retrieve the payroll published report
 *     description: Fetches a list of payroll reports that have been published for a company. The response includes payroll details and associated employees.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the payroll published report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       payrollName:
 *                         type: string
 *                         example: "March Payroll"
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-01"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-03-31"
 *                       payrolls:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             fullname:
 *                               type: string
 *                               example: "John Doe"
 *                             position:
 *                               type: string
 *                               example: "Software Engineer"
 *                             grossSalary:
 *                               type: number
 *                               format: float
 *                               example: 5000
 *                             basicSalary:
 *                               type: number
 *                               format: float
 *                               example: 3000
 *                             taxableIncome:
 *                               type: number
 *                               format: float
 *                               example: 2000
 *                             incomeTax:
 *                               type: number
 *                               format: float
 *                               example: 200
 *                             totalDeduction:
 *                               type: number
 *                               format: float
 *                               example: 300
 *                             totalAllowance:
 *                               type: number
 *                               format: float
 *                               example: 150
 *                             NetSalary:
 *                               type: number
 *                               format: float
 *                               example: 4500
 *                             employee_pension_amount:
 *                               type: number
 *                               format: float
 *                               example: 100
 *                             employer_pension_amount:
 *                               type: number
 *                               format: float
 *                               example: 200
 *       '404':
 *         description: Payroll report not found
 *       '503':
 *         description: Service unavailable - An error occurred while processing the request
 */
/**
 * @swagger
 * /api/reports/payroll-published-report/pdf:
 *   get:
 *     summary: Download the payroll published report as an Excel file
 *     description: Generates and downloads an Excel report containing payroll details for processed payrolls and their associated employees.
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully generated and downloaded the payroll report
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Payroll report not found
 *       '503':
 *         description: Service unavailable - An error occurred while processing the request
 */

router.get(
  "/project-salary-report",
  middleware.validateUserAgent,
  reportController.generateProjectSalaryReport
);
router.get(
  "/payroll-published-report",
  middleware.validateUserAgent,
  middleware.protectAll,
  reportController.getPayrollPublishedReport
);

router.get(
  "/payroll-published-report/pdf",
  middleware.protectAll,
  reportController.downloadExcelReport
);
router.get(
  "/payroll/monthly",
  middleware.validateUserAgent,
  reportController.getPayrollPublishedReportPerMonth
);

router.get(
  "/payroll-published-report-based-on-location",
  middleware.validateUserAgent,
  reportController.getPayrollPublishedReportBasedOnSiteLocation
);

module.exports = router;
