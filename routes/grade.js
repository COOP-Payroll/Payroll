const express = require("express");
const grade = require("../controllers/grade");
const middleware = require("../middleware/auth");

// generalsetup;
// payrollsetup;
// payrollpublish;
// PayrollPublishedReport;
// EmployeeInfornation;
// EmployeeList;
// reports;

const router = express.Router();
//
//get all grade of the same company

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/grade:
 *   get:
 *     summary: Get all grades
 *     description: Retrieve a list of all salary grades for the company.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of grades.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the grade.
 *                       name:
 *                         type: string
 *                         description: The name of the grade.
 *                       minSalary:
 *                         type: number
 *                         format: float
 *                         description: The minimum salary for the grade.
 *                       maxSalary:
 *                         type: number
 *                         format: float
 *                         description: The maximum salary for the grade.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to retrieve the grades.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  // middleware.checkPermissions({ name: 'payroll', value:'approve' }),
  grade.getAllGrade
);

//get specific grade of company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  grade.getGradeById
);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/grade/allowance/{id}:
 *   get:
 *     summary: Get allowances for a grade by ID
 *     description: Retrieve the list of allowances associated with a specific salary grade.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the grade.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of allowances.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Allowance ID.
 *                       name:
 *                         type: string
 *                         description: Name of the allowance.
 *                       amount:
 *                         type: number
 *                         format: float
 *                         description: Allowance amount.
 *       '404':
 *         description: Grade not found or no allowances available.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access allowances.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 * /api/grade/deduction/{id}:
 *   get:
 *     summary: Get deductions for a grade by ID
 *     description: Retrieve the list of deductions associated with a specific salary grade.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the grade.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of deductions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Deduction ID.
 *                       name:
 *                         type: string
 *                         description: Name of the deduction.
 *                       amount:
 *                         type: number
 *                         format: float
 *                         description: Deduction amount.
 *       '404':
 *         description: Grade not found or no deductions available.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access deductions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/allowance/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  grade.fetchAllowanceByGradeById
);

router.get(
  "/deduction/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  grade.fetchDeductionByGradeById
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/grade:
 *   post:
 *     summary: Create a new grade
 *     description: Create a new salary grade with specified name, minimum salary, and maximum salary.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the grade.
 *               minSalary:
 *                 type: number
 *                 format: float
 *                 description: The minimum salary for the grade.
 *               maxSalary:
 *                 type: number
 *                 format: float
 *                 description: The maximum salary for the grade.
 *             required:
 *               - name
 *               - minSalary
 *               - maxSalary
 *     responses:
 *       '200':
 *         description: Successfully created the grade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   description: The newly created grade object.
 *       '400':
 *         description: Bad Request - Invalid data, such as the minimum salary being greater than the maximum salary or data duplication.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to create a grade.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//add grade of company
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  grade.createGrade
);

//update grade of company
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  grade.updateGrade
);
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/grade/{id}:
 *   get:
 *     summary: Get a grade by ID
 *     description: Retrieve a salary grade by its unique ID.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the grade to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved the grade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the grade.
 *                     name:
 *                       type: string
 *                       description: The name of the grade.
 *                     minSalary:
 *                       type: number
 *                       format: float
 *                       description: The minimum salary for the grade.
 *                     maxSalary:
 *                       type: number
 *                       format: float
 *                       description: The maximum salary for the grade.
 *       '404':
 *         description: Grade not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access the grade.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   put:
 *     summary: Update a grade by ID
 *     description: Update a salary grade with the provided ID.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the grade to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the grade.
 *               minSalary:
 *                 type: number
 *                 format: float
 *                 description: The minimum salary for the grade.
 *               maxSalary:
 *                 type: number
 *                 format: float
 *                 description: The maximum salary for the grade.
 *             required:
 *               - name
 *               - minSalary
 *               - maxSalary
 *     responses:
 *       '200':
 *         description: Successfully updated the grade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   description: The updated grade object.
 *       '400':
 *         description: Bad Request - Invalid data provided.
 *       '404':
 *         description: Grade not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to update the grade.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   delete:
 *     summary: Delete a grade by ID
 *     description: Delete a salary grade by its unique ID.
 *     tags:
 *       - Grades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the grade to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully deleted the grade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *       '404':
 *         description: Grade not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to delete the grade.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//delete grade of company
router.delete(
  "/:id",

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  grade.deleteGrade
);

module.exports = router;
