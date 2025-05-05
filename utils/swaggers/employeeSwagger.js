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
 *                     example: "Ethiopia"
 *                   state:
 *                     type: string
 *                     example: "Oromia"
 *                   zone_or_city:
 *                     type: string
 *                     example: "Bole"
 *                   woreda:
 *                     type: string
 *                     example: "13"
 *                   kebele:
 *                     type: string
 *                     example: "05"
 *                   houseNumber:
 *                     type: string
 *                     example: "09345"
 *               employeeInfo:
 *                 type: object
 *                 properties:
 *                   employeeTIN:
 *                     type: string
 *                     example: "4324324"
 *                   title:
 *                     type: string
 *                     example: "Mr"
 *                   employeeType:
 *                     type: string
 *                     example: "permanent"
 *                   hireDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-25"
 *                   employee_Code:
 *                     type: string
 *                     example: "CG34"
 *                   basicSalary:
 *                     type: number
 *                     format: float
 *                     example: 15000
 *                   position:
 *                     type: integer
 *                     example: 2
 *                   siteLocation:
 *                     type: string
 *                     example: "AA"
 *               emergencyInfo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: "Bulti F"
 *                     relation:
 *                       type: string
 *                       example: "Father"
 *                     phoneNumber:
 *                       type: string
 *                       example: "094324324324"
 *                     address:
 *                       type: string
 *                       example: "Addis Ababa"
 *               basicInfo:
 *                 type: object
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: "Gemechu Bulti"
 *                   images:
 *                     type: string
 *                     example: ""
 *                   sex:
 *                     type: string
 *                     example: "male"
 *                   date_of_birth:
 *                     type: string
 *                     format: date
 *                     example: "2025-02-25"
 *                   DepartmentId:
 *                     type: integer
 *                     example: 2
 *                   GradeId:
 *                     type: integer
 *                     example: 2
 *                   zoneId:
 *                     type: integer
 *                     example: 5
 *                   woredaId:
 *                     type: integer
 *                     example: 10
 *                   marriageStatus:
 *                     type: string
 *                     example: "Single"
 *                   isActive:
 *                     type: boolean
 *                     example: true
 *                   nationality:
 *                     type: string
 *                     example: "ET"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "gemee12eeeede@gmail.com"
 *                   phoneNumber:
 *                     type: string
 *                     example: "09324324324"
 *                   optionalPhoneNumber:
 *                     type: string
 *                     example: ""
 *                   id_type:
 *                     type: string
 *                     example: "passport"
 *                   id_Number:
 *                     type: string
 *                     example: "kb432432"
 *               accountInformation:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountNumber:
 *                       type: string
 *                       example: ""
 *                     phoneNumber:
 *                       type: string
 *                       example: "0949098765"
 *                     paymentMethod:
 *                       type: string
 *                       example: "phone"
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
/**
 * @swagger
 * /api/employee/download-employee-registration-pdf:
 *   get:
 *     summary: Download API documentation as PDF
 *     description: Generates and downloads the API documentation in PDF format.
 *     tags:
 *       - API Documentation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: PDF document downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *       '500':
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/employee/register/bulk:
 *   post:
 *     summary: Bulk register employees from Excel file
 *     description: Allows company admins to upload an Excel file and register multiple employees in bulk.
 *     tags:
 *       - Employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing employee data
 *     responses:
 *       '200':
 *         description: Employees registered successfully
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
 *                   example: Employees registered successfully
 *       '400':
 *         description: Bad request - Missing required fields or validation errors
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *       '404':
 *         description: File not uploaded
 *       '500':
 *         description: Internal server error
 */
