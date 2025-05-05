const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
// const { accountInfoMulter, upload } = require("../middleware/multer.js");
const newEmployeeController = require("../controllers/newEmployeeControllers.js");



router.put(
  "/unassign-approver/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.UnAssignApprovers
);

router.put(
  "/update-contact-info/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.updateContactInfo
);


router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  // middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getAllEmployee
);

router.get(
  "/employees-with-custom-role",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getEmployeeWithCustomRole
);

router.get(
  "/get-all-projects/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getAllProjectEmployeeInvolded
);

router.get(
  "/download-excel",
  middleware.protectAll,
  // middleware.restrictALL({
  //   moduleName: "employeeinfo",
  //   isAccessible: true,
  // }),
  newEmployeeController.downloadEmployeeTemplate
);

// Route for downloading the employee registration PDF
router.get(
  "/download-employee-registration-pdf",
  middleware.protectAll,
  newEmployeeController.downloadEmployeeRegistrationDoc
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
 * /api/employee/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     description: Retrieve a specific employee's details by their ID.
 *     tags:
 *       - Employee
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the employee to fetch.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved employee details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     fullName:
 *                       type: string
 *                       example: "Alemu Tesfaye"
 *                     gender:
 *                       type: string
 *                       example: "male"
 *                     positionName:
 *                       type: string
 *                       example: "Director"
 *                     gradeName:
 *                       type: string
 *                       example: "Grade X"
 *                     employeeId:
 *                       type: string
 *                       example: "test3/HR /2023/0006"
 *                     address:
 *                       type: object
 *                       properties:
 *                         street:
 *                           type: string
 *                           example: "1234 Elm St."
 *                         city:
 *                           type: string
 *                           example: "Nairobi"
 *                         state:
 *                           type: string
 *                           example: "Nairobi"
 *                         country:
 *                           type: string
 *                           example: "Kenya"
 *       '400':
 *         description: Bad Request - Employee not found or invalid request.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access the employee's details.
 *       '500':
 *         description: Internal Server Error.
 */

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getEmployeeById
);
router.post(
  "/",
  upload.fields([
    { name: "basicInfo[image]", maxCount: 1 },
    { name: "basicInfo[id_image]", maxCount: 1 },
    { name: "accountInformation[0][image]", maxCount: 1 },
    { name: "accountInformation[1][image]", maxCount: 1 },
    { name: "accountInformation[2][image]", maxCount: 1 },
  ]),
  middleware.protectAll,
  // middleware.restrictALL({
  //   moduleName: "EmployeeList",
  //   isAccessible: true,
  // }),
  // employeeController.createEmployeed
  newEmployeeController.createEmployee
);

router.get(
  "/company/employees",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  newEmployeeController.getAllEmployee
);

router.get(
  "/current-project/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  employeeController.employeesCurrentProject
);
router.get(
  "/previous-project/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  employeeController.employeesPreviousProject
);

router.get(
  "/employee-history/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  newEmployeeController.getEmployeeHistory
);

router.get(
  "/department/:departmentId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.findByDepartment
);

router.put(
  "/additionalPay/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  employeeController.addAddionalPay
);

router.put(
  "/update-basic-info/:id",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updatedBasicInfo
);

router.put(
  "/update-termination-status/:id",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateTermination
);

router.put(
  "/update-emergency-info/:employeeId",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmergencyContact
);
router.put(
  "/update-account-info/:employeeId",
  middleware.validateUserAgent,
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "accountImage", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateAccountInfo
);

router.put(
  "/update-employee-info/:id",
  middleware.validateUserAgent,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmployee
);

router.put(
  "/update-employement-info/:id",
  // upload.fields([
  //   { name: "image", maxCount: 1 },
  //   { name: "id_image", maxCount: 1 },
  // ]),

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmployementInfo
);

router.put(
  "/promotion/:id",

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  upload.fields([{ name: "letter", maxCount: 1 }]),
  newEmployeeController.promotion
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),

  employeeController.deleteEmployee
);
//payrollpublish
//payrollpublishedreport
//reports
router.post(
  "/excel",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  employeeController.createEmployeeFile
);

router.post(
  "/login",
  middleware.validateUserAgent,
  newEmployeeController.employeeLogin
);

router.post(
  "/register/bulk",
  middleware.validateUserAgent,

  middleware.protectAll,
  upload.fields([{ name: "file", maxCount: 1 }]),
  newEmployeeController.bulkRegister
);

router.get(
  "/confirm/:id",
  middleware.validateUserAgent,
  newEmployeeController.confirmaRegistration
);

module.exports = router;
