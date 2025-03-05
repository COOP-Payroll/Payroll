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
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/employee/download-excel:
 *   get:
 *     summary: Download Employee Template
 *     description: Generates and downloads an Excel file containing employee data, departments, positions, grades, and instructions.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully generated and downloaded the employee template.
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       '400':
 *         description: Bad Request - Possibly invalid parameters or access denied.
 *       '401':
 *         description: Unauthorized - Authentication failed or token missing.
 *       '403':
 *         description: Forbidden - User does not have permission to access this resource.
 *       '500':
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/employee/employees-with-custom-role:
 *   get:
 *     summary: Get all employees with a custom role
 *     description: Retrieve a list of all employees with a custom role.
 *     tags:
 *       - System User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of employees with a custom role.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access the employee list.
 *       '500':
 *         description: Internal Server Error.
 */
/**
 * @swagger
 * /api/employee/update-basic-info/{id}:
 *   put:
 *     summary: Update an employee's basic information
 *     description: Updates an employee's basic details including name, marriage status, and ID details. Allows updating the ID image.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Employee's full name.
 *               marriageStatus:
 *                 type: string
 *                 enum: [Single, Married, Divorced]
 *                 description: Employee's marital status.
 *               id_type:
 *                 type: string
 *                 description: Type of identification document.
 *               id_Number:
 *                 type: string
 *                 description: Identification document number.
 *               id_image:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image of the ID.
 *     responses:
 *       '200':
 *         description: Employee basic information updated successfully.
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
 *                   example: Employee basic information updated successfully.
 *       '400':
 *         description: Bad request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '404':
 *         description: Not Found - Employee does not exist.
 *       '503':
 *         description: Service Unavailable - An error occurred, please try again later.
 */

/**
 * @swagger
 * /api/employee/update-contact-info/{employeeId}:
 *   put:
 *     summary: Update an employee's contact information
 *     description: Updates an employee's email, phone number, and address details.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee whose contact info is being updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address.
 *               phoneNumber:
 *                 type: string
 *                 description: Employee's phone number.
 *               country:
 *                 type: string
 *                 description: Country of residence.
 *               state:
 *                 type: string
 *                 description: State of residence.
 *               region:
 *                 type: string
 *                 description: Region of residence.
 *               zone_or_city:
 *                 type: string
 *                 description: City or zone of residence.
 *               woreda:
 *                 type: string
 *                 description: Woreda (administrative division).
 *               kebele:
 *                 type: string
 *                 description: Kebele (smallest administrative unit).
 *               houseNumber:
 *                 type: string
 *                 description: House number.
 *     responses:
 *       '200':
 *         description: Contact information updated successfully.
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
 *                   example: Contact info updated successfully.
 *       '400':
 *         description: Bad request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '404':
 *         description: Not Found - Employee does not exist.
 *       '503':
 *         description: Service Unavailable - An error occurred, please try again later.
 */
/**
 * @swagger
 * /api/employee/update-account-info/{employeeId}:
 *   put:
 *     summary: Update an employee's account information
 *     description: Updates an employee's bank account details, including account number and verification status. Allows uploading an account image.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee whose account info is being updated.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *                 description: The ID of the account to be updated.
 *               accountNumber:
 *                 type: string
 *                 description: Employee's account number.
 *                 example: "123456789"
 *               accountImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload a new account image.
 *               isVerified:
 *                 type: boolean
 *                 description: Whether the account is verified or not.
 *                 example: true
 *     responses:
 *       '200':
 *         description: Account information updated successfully.
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
 *                   example: Account information updated successfully.
 *       '400':
 *         description: Bad request - Missing account number.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '404':
 *         description: Not Found - Account not found.
 *       '503':
 *         description: Service Unavailable - An error occurred, please try again later.
 */
/**
 * @swagger
 * /api/employee/employee-history/{id}:
 *   get:
 *     summary: Retrieve an employee's historical positions
 *     description: Fetches all historical positions for an employee, showing only inactive positions.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the employee whose history is being retrieved.
 *     responses:
 *       '200':
 *         description: Successfully retrieved employee history.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   PositionId:
 *                     type: integer
 *                     description: The ID of the historical position.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '404':
 *         description: Not Found - Employee not found.
 *       '503':
 *         description: Service Unavailable - An error occurred, please try again later.
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
 *     description: Retrieve a list of all employees with pagination.
 *     tags:
 *       - Employee
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination (defaults to 1).
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of employees per page (defaults to 10).
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of employees.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Data fetched Successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                         example: "Alemu Tesfaye"
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                       positionName:
 *                         type: string
 *                         example: "Director"
 *                       gradeName:
 *                         type: string
 *                         example: "Grade X"
 *                       employeeId:
 *                         type: string
 *                         example: "test3/HR /2023/0006"
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
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.downloadEmployeeTemplate
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
  middleware.restrictALL({
    moduleName: "EmployeeList",
    isAccessible: true,
  }),
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
