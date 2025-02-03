const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const departmentController = require("../controllers/department.js");

// Define routes for handling User requests

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/department:
 *   get:
 *     summary: Get all departments
 *     description: Retrieve a list of all departments.
 *     tags:
 *       - Department
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved departments.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *
 *   post:
 *     summary: Create a new department
 *     description: Add a new department to the system.
 *     tags:
 *       - Department
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deptName:
 *                 type: string
 *                 example: "HR Department"
 *               location:
 *                 type: string
 *                 example: "Headquarters"
 *               shorthandRepresentation:
 *                 type: string
 *                 example: "HR"
 *     responses:
 *       '200':
 *         description: Department created successfully.
 *       '400':
 *         description: Bad request - Department already exists.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '503':
 *         description: Service unavailable - Server error.
 *
 * /api/department/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Retrieve a specific department by its ID.
 *     tags:
 *       - Department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The department ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved department.
 *       '404':
 *         description: Department not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *
 *   put:
 *     summary: Update department by ID
 *     description: Modify details of a specific department.
 *     tags:
 *       - Department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The department ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deptName:
 *                 type: string
 *                 example: "Updated Department Name"
 *               location:
 *                 type: string
 *                 example: "Updated Location"
 *               shorthandRepresentation:
 *                 type: string
 *                 example: "HRU"
 *     responses:
 *       '200':
 *         description: Successfully updated department.
 *       '400':
 *         description: Bad request - Invalid department data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *
 *   delete:
 *     summary: Delete department by ID
 *     description: Remove a department from the system.
 *     tags:
 *       - Department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The department ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully deleted department.
 *       '404':
 *         description: Department not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 */

//GET ALL DEPARTMENT
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.getAllDepartment
);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.createDepartment
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.deleteDepartment
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.updateDepartment
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.getDepartmentById
);

module.exports = router;
