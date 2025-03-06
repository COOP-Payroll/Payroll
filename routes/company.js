const express = require("express");
const companyController = require("../controllers/companyController.js");
const upload = require("../middleware/multer");
const router = express.Router();
const middleware = require("../middleware/auth.js");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/company:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve a list of all companies.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved companies.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *
 *   post:
 *     summary: Create a new company
 *     description: Add a new company to the system.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "Company XYZ"
 *               email:
 *                 type: string
 *                 example: "contact@companyxyz.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "1234567890"
 *               companyCode:
 *                 type: string
 *                 example: "ABC123"
 *               numberOfEmployees:
 *                 type: string
 *                 example: "100"
 *               region_or_City:
 *                 type: string
 *                 example: "New York"
 *               addressStreet:
 *                 type: string
 *                 example: "123 Main Street"
 *               fax:
 *                 type: string
 *                 example: "123-456-789"
 *               notes:
 *                 type: string
 *                 example: "This is a tech company."
 *               packageId:
 *                 type: string
 *                 example: "1"
 *               isProjectBased:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '200':
 *         description: Company created successfully.
 *       '400':
 *         description: Bad request - Company already exists.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Server failure.
 *
 * /api/company/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieve a specific company by its ID.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The company ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved company.
 *       '404':
 *         description: Company not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *
 *   put:
 *     summary: Update company by ID
 *     description: Modify details of a specific company.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The company ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 example: "Updated Company XYZ"
 *               email:
 *                 type: string
 *                 example: "new_contact@companyxyz.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0987654321"
 *               companyCode:
 *                 type: string
 *                 example: "XYZ456"
 *               numberOfEmployees:
 *                 type: string
 *                 example: "200"
 *               region_or_City:
 *                 type: string
 *                 example: "San Francisco"
 *               addressStreet:
 *                 type: string
 *                 example: "456 Another Street"
 *               fax:
 *                 type: string
 *                 example: "987-654-321"
 *               notes:
 *                 type: string
 *                 example: "Updated company information."
 *               packageId:
 *                 type: string
 *                 example: "2"
 *               isProjectBased:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       '200':
 *         description: Successfully updated company.
 *       '400':
 *         description: Bad request - Invalid company data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *
 *   delete:
 *     summary: Delete company by ID
 *     description: Remove a company from the system.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The company ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully deleted company.
 *       '404':
 *         description: Company not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 */
/**
 * @swagger
 * /api/company/update-loan-status:
 *   put:
 *     summary: Update loan status for a company
 *     description: Updates the loan status of a company. Only accessible by company admins.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isLoanGranted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       '200':
 *         description: Loan status updated successfully.
 *       '400':
 *         description: Bad request - Invalid input or loan status is already set.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '404':
 *         description: Company not found.
 *       '503':
 *         description: Service unavailable - An error occurred, please try again later.
 */

router.put(
  "/setpassword/:token",
  middleware.validateUserAgent,
  companyController.resetPasswordToken
);

router.post(
  "/",
  middleware.validateUserAgent,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "companyBanner", maxCount: 1 },
    { name: "acctImage", maxCount: 1 },
  ]),
  companyController.createCompany
);

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  middleware.sanitizeInput,
  middleware.validateUserAgent,
  companyController.getAllCompany
);

router.put(
  "/update-loan-status",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  middleware.sanitizeInput,
  middleware.validateUserAgent,
  companyController.updateLoanStatus
);
router.get(
  "/:id",
  middleware.validateUserAgent,
  companyController.getCompanyById
);
router.post("/", middleware.validateUserAgent, companyController.createCompany);

router.put("/set");
/**
 * @swagger
 * /api/company/get/companyprofile:
 *   get:
 *     summary: Get company profile
 *     description: Retrieve the profile details of the authenticated user's company.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved company profile.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '404':
 *         description: Company profile not found.
 *       '500':
 *         description: Internal Server Error.
 */

router.get(
  "/get/companyprofile",
  middleware.protectAll,
  middleware.validateUserAgent,
  companyController.getcompanyProfiles
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
 * /api/company/update-company-profile:
 *   put:
 *     summary: Update company profile
 *     description: Update the profile details of the authenticated company, including logo, banner, and company details.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Innovations Ltd"
 *               numberOfEmployees:
 *                 type: integer
 *                 example: 150
 *               organizationName:
 *                 type: string
 *                 example: "Tech Innovations"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@techinnovations.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               jobTitle:
 *                 type: string
 *                 example: "Senior Developer"
 *               country:
 *                 type: string
 *                 example: "Ethiopia"
 *               region_or_City:
 *                 type: string
 *                 example: "Addis Ababa"
 *               fax:
 *                 type: string
 *                 example: "+1234567891"
 *               address_Street:
 *                 type: string
 *                 example: "123 Innovation Street"
 *               notes:
 *                 type: string
 *                 example: "Leading company in tech solutions."
 *               primary_Color:
 *                 type: string
 *                 example: "#ff5733"
 *               primary_Font_Color:
 *                 type: string
 *                 example: "#ffffff"
 *               primary_Gradient_Color:
 *                 type: string
 *                 example: "#ff5733, #ffbd33"
 *               secondary_Color:
 *                 type: string
 *                 example: "#33c1ff"
 *               secondary_Font_Color:
 *                 type: string
 *                 example: "#000000"
 *               secondary_Gradient_Color:
 *                 type: string
 *                 example: "#33c1ff, #33ff57"
 *               social_Media_Images:
 *                 type: boolean
 *                 example: false
 *                 description: Whether social media images are enabled for the company (true or false).
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: The company logo image file (optional).
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: The company banner image file (optional).
 *     responses:
 *       '200':
 *         description: Successfully updated company profile.
 *       '400':
 *         description: Bad request - Invalid data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have permission.
 *       '404':
 *         description: Not found - Company not found.
 *       '500':
 *         description: Internal Server Error - Failed to update the company profile.
 *       '503':
 *         description: Service unavailable - Server failure.
 */

// /**
//  * @swagger
//  * components:
//  *   securitySchemes:
//  *     bearerAuth:
//  *       type: http
//  *       scheme: bearer
//  *       bearerFormat: JWT
//  *
//  * /api/company/update-company-profile/{id}:
//  *   put:
//  *     summary: Update company profile
//  *     description: Update the profile details of a specific company, including logo, banner, and theme colors.
//  *     tags:
//  *       - Company
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The company ID.
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               primary_Color:
//  *                 type: string
//  *                 example: "#ff5733"
//  *               primary_Font_Color:
//  *                 type: string
//  *                 example: "#ffffff"
//  *               primary_Gradient_Color:
//  *                 type: string
//  *                 example: "#ff5733, #ffbd33"
//  *               secondary_Color:
//  *                 type: string
//  *                 example: "#33c1ff"
//  *               secondary_Font_Color:
//  *                 type: string
//  *                 example: "#000000"
//  *               secondary_Gradient_Color:
//  *                 type: string
//  *                 example: "#33c1ff, #33ff57"
//  *               social_Media_Images:
//  *                 type: boolean
//  *                 example: false
//  *                 description: Whether social media images are enabled for the company (true or false).
//  *               logo:
//  *                 type: string
//  *                 format: binary
//  *                 description: The company logo image file (optional).
//  *               banner:
//  *                 type: string
//  *                 format: binary
//  *                 description: The company banner image file (optional).
//  *     responses:
//  *       '200':
//  *         description: Successfully updated company profile.
//  *       '400':
//  *         description: Bad request - Invalid data.
//  *       '401':
//  *         description: Unauthorized - Token is missing or invalid.
//  *       '403':
//  *         description: Forbidden - User does not have permission.
//  *       '500':
//  *         description: Internal Server Error - Failed to update the company profile.
//  *       '503':
//  *         description: Service unavailable - Server failure.
//  */

router.put(
  "/update-company-profile/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  companyController.updateCompanyProfile
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
 * /api/company/profile/reset-to-default:
 *   get:
 *     summary: Reset company profile to default settings
 *     description: Resets the company's profile settings to default values (colors, font colors, etc.).
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully reset to default company profile.
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
 *                   example: "Reset to default successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     primary_Color:
 *                       type: string
 *                       example: "#00adef"
 *                     primary_Font_Color:
 *                       type: string
 *                       example: "#000000"
 *                     primary_Gradient_Color:
 *                       type: string
 *                       example: ""
 *                     secondary_Color:
 *                       type: string
 *                       example: "#008000"
 *                     secondary_Font_Color:
 *                       type: string
 *                       example: "#ffffff"
 *                     secondary_Gradient_Color:
 *                       type: string
 *                       example: ""
 *                     social_Media_Images:
 *                       type: boolean
 *                       example: true
 *       '400':
 *         description: Bad request - Invalid request data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the required permissions.
 *       '500':
 *         description: Internal Server Error - Server failure during reset process.
 *       '503':
 *         description: Service unavailable - Server is temporarily unavailable.
 */

router.get(
  "/profile/reset-to-default",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL("companyAdmin"),
  companyController.resetTodefauldCompanyProfiles
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
 * /api/company/update-account-info:
 *   put:
 *     summary: Update company account information
 *     description: Updates the company account information, including account number, reference number, and related documents like reference letter and image.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: "1234567890"
 *               referenceNumber:
 *                 type: string
 *                 example: "REF12345"
 *               referenceLetter:
 *                 type: string
 *                 format: binary
 *                 description: A reference letter file to be uploaded
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: A company image file to be uploaded
 *     responses:
 *       '200':
 *         description: Successfully updated the account information.
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
 *                   example: "Account info updated successfully"
 *       '400':
 *         description: Bad request - Missing required fields or files.
 *       '404':
 *         description: Not Found - Company not found.
 *       '503':
 *         description: Service unavailable - An error occurred during the update process.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the required permissions.
 */

router.put(
  "/update-account-info/",
  middleware.protectAll,
  middleware.validateUserAgent,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "referenceLetter", maxCount: 1 },
  ]),
  companyController.updateAccountInfo
);
/**
 * @swagger
 * /api/company/update-details:
 *   put:
 *     summary: Update company details
 *     description: Endpoint to update the company details, such as name, organization name, contact information, and address. A valid token is required.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *           format: Bearer <token>
 *     requestBody:
 *       description: JSON object containing fields to update company details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the company
 *                 example: Tech Innovations Ltd
 *               numberOfEmployees:
 *                 type: integer
 *                 description: Number of employees in the company
 *                 example: 150
 *               organizationName:
 *                 type: string
 *                 description: Official name of the organization
 *                 example: Tech Innovations
 *               email:
 *                 type: string
 *                 description: Contact email of the company
 *                 example: contact@techinnovations.com
 *               phoneNumber:
 *                 type: string
 *                 description: Primary contact number of the company
 *                 example: "+1234567890"
 *               companyLogo:
 *                 type: string
 *                 description: URL of the company's logo
 *                 example: "https://example.com/logo.png"
 *               jobTitle:
 *                 type: string
 *                 description: Job title of the user updating the details
 *                 example: Senior Developer
 *               country:
 *                 type: string
 *                 description: Country where the company is based
 *                 example: Ethiopia
 *               region_or_City:
 *                 type: string
 *                 description: Region or city of the company
 *                 example: Addis Ababa
 *               fax:
 *                 type: string
 *                 description: Fax number of the company
 *                 example: "+1234567891"
 *               address_Street:
 *                 type: string
 *                 description: Street address of the company
 *                 example: "123 Innovation Street"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the company
 *                 example: "Leading company in tech solutions."
 *     responses:
 *       200:
 *         description: Successfully updated company details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company details updated successfully
 *                 company:
 *                   type: object
 *                   description: Updated company details
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Tech Innovations Ltd
 *                     numberOfEmployees:
 *                       type: integer
 *                       example: 150
 *                     organizationName:
 *                       type: string
 *                       example: Tech Innovations
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Token is missing or invalid
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */

// router.put(
//   "/updatecompanydetails",
//   middleware.protectAll,
//   middleware.restrictALL("companyAdmin"),
//   upload.fields([
//     { name: "companyLogo", maxCount: 1 },
//     { name: "header", maxCount: 1 },
//     { name: "footer", maxCount: 1 },
//   ]),
//   companyController.updateCompanyDetails
// );

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/company/{id}:
 *   put:
 *     summary: Update company details
 *     description: Updates the details of a specific company, including logo, header, and footer images, and other company-related information.
 *     tags:
 *       - Company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique identifier of the company to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: The company logo to be uploaded
 *               header:
 *                 type: string
 *                 format: binary
 *                 description: The header image to be uploaded
 *               footer:
 *                 type: string
 *                 format: binary
 *                 description: The footer image to be uploaded
 *               name:
 *                 type: string
 *                 example: "New Company Name"
 *                 description: The company name
 *               address:
 *                 type: string
 *                 example: "123 Business Street, City, Country"
 *                 description: The company address
 *               email:
 *                 type: string
 *                 example: "contact@company.com"
 *                 description: The company email
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: The company phone number
 *               website:
 *                 type: string
 *                 example: "https://company.com"
 *                 description: The company website URL
 *     responses:
 *       '200':
 *         description: Successfully updated the company details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Updated successfully"
 *       '400':
 *         description: Bad request - Missing or invalid fields.
 *       '404':
 *         description: Not Found - Company not found.
 *       '503':
 *         description: Service unavailable - An error occurred during the update process.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the required permissions.
 */

router.put(
  "/:id",
  middleware.validateUserAgent,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "header", maxCount: 1 },
    { name: "footer", maxCount: 1 },
  ]),
  companyController.updateCompany
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
 * /api/company/project/update/isProjectBased:
 *   put:
 *     summary: Update project-based status of the company
 *     description: Updates the project-based status of the company, changing whether the company is project-based or not.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isProjectBased:
 *                 type: boolean
 *                 description: The new project-based status for the company.
 *                 example: true
 *     responses:
 *       '200':
 *         description: Successfully updated the project-based status of the company.
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
 *                   example: "Project based company updated successfully"
 *       '400':
 *         description: Bad request - Invalid value for isProjectBased, it must be a boolean.
 *       '404':
 *         description: Not Found - Company not found.
 *       '503':
 *         description: Service unavailable - An error occurred during the update process.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the required permissions.
 */

router.put(
  "/project/update/isProjectBased",
  middleware.protectAll,
  middleware.validateUserAgent,

  companyController.updateProjectBased
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin"),
  companyController.deleteCompany
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
 * /api/company/all/activeCompany:
 *   get:
 *     summary: Get all active companies
 *     description: Fetches a list of all companies that are currently active.
 *     tags:
 *       - Company
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched the list of active companies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The number of active companies.
 *                   example: 5
 *                 message:
 *                   type: string
 *                   description: A success message.
 *                   example: "Fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the company.
 *                         example: 1
 *                       companyName:
 *                         type: string
 *                         description: The name of the company.
 *                         example: "Active Company Ltd."
 *                       status:
 *                         type: string
 *                         description: The status of the company.
 *                         example: "active"
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have the required permissions (superAdmin).
 *       '503':
 *         description: Service unavailable - An error occurred while fetching active companies.
 */

router.get(
  "/all/activeCompany",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  companyController.getAllActiveCompany
);
router.get(
  "/all/blockedCompany",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  companyController.getAllBlockedCompany
);
router.get(
  "/all/deniedCompany",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin"),
  companyController.getAllDeniedCompany
);
router.get(
  "/all/pendingCompany",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("superAdmin"),
  companyController.getAllPendingCompany
);

router.get(
  "/all/deactiveCompany",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  companyController.getDeactivatedCompany
);
router.get(
  "/subscriptionLeftDate/:companyId",
  middleware.validateUserAgent,
  // middleware.restrictTo("superAdmin"),
  companyController.getSubscriptionLeftDate
);

module.exports = router;
