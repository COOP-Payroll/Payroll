const express = require("express");
const customRoleControllers = require("../controllers/customRole.js");
const middleware = require("../middleware/auth.js");

const router = express.Router();
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CustomRole:
 *       type: object
 *       required:
 *         - name
 *         - permission
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the custom role.
 *         permission:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               module:
 *                 type: string
 *                 description: The module name associated with the role.
 *               isAccessible:
 *                 type: boolean
 *                 description: Defines if the role has access to the module.
 *
 * /api/customRole:
 *   post:
 *     summary: Create a new custom role
 *     description: Allows a company admin to create a custom role with specific permissions.
 *     tags:
 *       - Custom Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomRole'
 *     responses:
 *       '200':
 *         description: Successfully created a new custom role.
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
 *                       description: The ID of the newly created role.
 *                     name:
 *                       type: string
 *                       description: The name of the role.
 *       '400':
 *         description: Bad Request - Validation error (e.g., role already exists, missing permissions).
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can create custom roles.
 *       '500':
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
 *     AssignRole:
 *       type: object
 *       required:
 *         - roleId
 *         - employeeId
 *       properties:
 *         roleId:
 *           type: integer
 *           description: The ID of the role to assign.
 *         employeeId:
 *           type: integer
 *           description: The ID of the employee to assign the role to.
 *
 *     AssignRoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Role assigned successfully
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The ID of the employee.
 *             fullname:
 *               type: string
 *               description: The full name of the employee.
 *             CustomRoleId:
 *               type: integer
 *               description: The ID of the assigned custom role.
 *
 * /api/customRole/assignRoleToEmployee:
 *   put:
 *     summary: Assign a role to an employee
 *     description: Allows a company admin to assign a custom role to an employee.
 *     tags:
 *       - Custom Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRole'
 *     responses:
 *       '200':
 *         description: Successfully assigned the role to the employee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignRoleResponse'
 *       '400':
 *         description: Bad Request - Role is already assigned to the employee.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can assign roles.
 *       '404':
 *         description: Not Found - Employee or role not found.
 *       '500':
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
 *     CustomRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the custom role.
 *         name:
 *           type: string
 *           description: The name of the custom role.
 *
 * /api/customRole/{id}:
 *   delete:
 *     summary: Delete a custom role
 *     description: Deletes a custom role and all associated permissions.
 *     tags:
 *       - Custom Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the custom role to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Custom role deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Deleted successfully"
 *       '404':
 *         description: Not Found - The custom role does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "There is no Custom Role with this ID"
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Only company admins can delete custom roles.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/customRole:
 *   get:
 *     summary: Retrieve all custom roles for the company
 *     description: Fetches all custom roles associated with the authenticated company.
 *     tags:
 *       - Custom Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of custom roles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Manager"
 *                       description:
 *                         type: string
 *                         example: "Manages team operations"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-26T12:34:56Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-02-26T12:34:56Z"
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
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.getAllCustomRole
);
// router.get("/:id", CustomRole.getCustomRoleById);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.createCustomRole
);
router.put(
  "/update/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.updateCustomRole
);

router.put(
  "/assignRoleToEmployee",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.assignToEmployee
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),

  customRoleControllers.deleteCustomRole
);
module.exports = router;
