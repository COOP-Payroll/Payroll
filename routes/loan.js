const express = require("express");
const loanControllers = require("../controllers/loan.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();
/**
 * @swagger
 * /api/loan:
 *   get:
 *     summary: Get all active loans
 *     description: Retrieves all active loans for the current company.
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active loans.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The number of active loans.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The loan ID.
 *                       amount:
 *                         type: number
 *                         format: float
 *                         description: The loan amount.
 *                       isActive:
 *                         type: boolean
 *                         description: Indicates if the loan is active.
 *                       CompanyId:
 *                         type: integer
 *                         description: The ID of the company that owns the loan.
 *       '401':
 *         description: Unauthorized - Missing or invalid token.
 *       '403':
 *         description: Forbidden - User does not have access to this resource.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/loan:
 *   post:
 *     summary: Create a new loan
 *     description: Registers a new loan for an employee under a specific loan definition.
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - employeeId
 *               - loanDefinitionId
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The loan amount.
 *               employeeId:
 *                 type: integer
 *                 description: The ID of the employee receiving the loan.
 *               loanDefinitionId:
 *                 type: integer
 *                 description: The ID of the loan definition associated with the loan.
 *     responses:
 *       '201':
 *         description: Loan successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Loan successfully registered.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created loan.
 *                     amount:
 *                       type: number
 *                       format: float
 *                       description: The loan amount.
 *                     isActive:
 *                       type: boolean
 *                       description: Indicates if the loan is active.
 *       '400':
 *         description: Loan with this loan definition already exists for the employee.
 *       '404':
 *         description: Employee or loan definition not found.
 *       '401':
 *         description: Unauthorized - Missing or invalid token.
 *       '403':
 *         description: Forbidden - User does not have access to this resource.
 *       '503':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  loanControllers.getAllLoan
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  loanControllers.getAllowanceById
);
// router.get("/:id", allowance.getAllowanceById);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.createLoan
);
router.put(
  "/unassign/employee",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.unassignLoan
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.updateLoan
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.deleteLoan
);

module.exports = router;
