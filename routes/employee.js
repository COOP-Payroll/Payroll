const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
// const { accountInfoMulter, upload } = require("../middleware/multer.js");
const newEmployeeController = require("../controllers/newEmployeeControllers.js");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/employee:
 *   post:
 *     summary: Create a new employee
 *     description: Add a new employee to the system with their personal, emergency, and account information.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "ETHIOPIA"
 *                   state:
 *                     type: string
 *                     example: "Addis"
 *                   zone_or_city:
 *                     type: string
 *                     example: "Bole"
 *                   woreda:
 *                     type: string
 *                     example: "Bole"
 *                   kebele:
 *                     type: string
 *                     example: "Bole"
 *                   houseNumber:
 *                     type: string
 *                     example: "67747"
 *               employeeInfo:
 *                 type: object
 *                 properties:
 *                   employeeTIN:
 *                     type: string
 *                     example: "7129"
 *                   hireDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-05-19T12:06:56.341Z"
 *                   employee_Code:
 *                     type: string
 *                     example: "CG34"
 *                   basicSalary:
 *                     type: number
 *                     format: float
 *                     example: 16240
 *                   position:
 *                     type: integer
 *                     example: 1
 *                   siteLocation:
 *                     type: string
 *                     example: "Addis Ababa"
 *               emergencyInfo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     relation:
 *                       type: string
 *                       example: "Aymeku A."
 *                     phoneNumber:
 *                       type: string
 *                       example: "0918151551"
 *                     fullname:
 *                       type: string
 *                       example: "Teshomee"
 *               basicInfo:
 *                 type: object
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: "Yosef Abdiisaa"
 *                   images:
 *                     type: string
 *                     example: ""
 *                   sex:
 *                     type: string
 *                     example: "male"
 *                   date_of_birth:
 *                     type: string
 *                     format: date
 *                     example: "1998-02-09"
 *                   DepartmentId:
 *                     type: integer
 *                     example: 1
 *                   GradeId:
 *                     type: integer
 *                     example: 2
 *                   marriageStatus:
 *                     type: string
 *                     example: "Married"
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   nationality:
 *                     type: string
 *                     example: "ethiopian"
 *                   password:
 *                     type: string
 *                     example: "jk"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "yha211@gmail.com"
 *                   phoneNumber:
 *                     type: string
 *                     example: "09196564382"
 *                   optionalPhoneNumber:
 *                     type: string
 *                     example: "091754302"
 *                   id_type:
 *                     type: string
 *                     example: "kebele"
 *                   id_Number:
 *                     type: string
 *                     example: "3451446"
 *               accountInformation:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountNumber:
 *                       type: string
 *                       example: "1312848769"
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       '201':
 *         description: Successfully created the employee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Employee created successfully"
 *       '400':
 *         description: Bad request - Missing required fields (e.g., fullname, email, employeeTIN).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       '500':
 *         description: Internal server error - Error occurred while creating employee.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred, please try again later"
 */

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
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/employee:
 *   get:
 *     summary: Get all employees
 *     description: Retrieve a list of all employees.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of employees.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access the employee list.
 *       '500':
 *         description: Internal Server Error.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
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

  // middleware.protectAll,
  // middleware.restrictALL({
  //   moduleName: "employeeinfo",
  //   isAccessible: true,
  // }),
  newEmployeeController.downloadEmployeeTemplate
);

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
  middleware.restrictALL({
    moduleName: "EmployeeList",
    isAccessible: true,
  }),
  // employeeController.createEmployee
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

// router.put(
//   "/updateBasicInfo/:id",
//   upload.fields([
//     // { name: "image", maxCount: 1 },
//     { name: "id_image", maxCount: 1 },
//   ]),

//   middleware.protectAll,
//   middleware.restrictALL({
//     moduleName: "employeeinfo",
//     isAccessible: true,
//   }),
//   newEmployeeController.updatedBasicInfo
// );

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
