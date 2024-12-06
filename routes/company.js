const express = require("express");
const companyController = require("../controllers/companyController.js");
const upload = require("../middleware/multer");
const router = express.Router();
const middleware = require("../middleware/auth.js");

/**
 * @swagger
 * /company:
 *   post:
 *     summary: Add a list of Companys
 *     description: Returns a list of Company
 *     responses:
 *       200:
 *         description: Successful response
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

/**
 * @swagger
 * components:
 *   parameters:
 *     AuthHeader:
 *       name: Authorization
 *       in: header
 *       description: Bearer token for authentication
 *       required: true
 *       schema:
 *         type: string
 *         format: "Bearer <token>"
 * 
 * /api/company:
 *   get:
 *     summary: Get a list of packages
 *     description: Endpoint to retrieve a list of packages.
 *     tags:
 *       - Packages

 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve packages.
 */
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  middleware.sanitizeInput,
  middleware.validateUserAgent,
  companyController.getAllCompany
);
/**
 * @swagger
 * components:
 *   parameters:
 *     AuthHeader:
 *       name: Authorization
 *       in: header
 *       description: Bearer token for authentication
 *       required: true
 *       schema:
 *         type: string
 *         format: "Bearer <token>"
 * 
 * /api/company:
 *   get:
 *     summary: Get a list of packages
 *     description: Endpoint to retrieve a list of packages.
 *     tags:
 *       - Packages

 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of packages.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve packages.
 */
router.get(
  "/:id",
  middleware.validateUserAgent,
  companyController.getCompanyById
);
router.post("/", middleware.validateUserAgent, companyController.createCompany);

router.put("/set");

router.get(
  "/get/companyprofile",
  middleware.protectAll,
  middleware.validateUserAgent,
  companyController.getcompanyProfiles
);

/**
 * @swagger
 * components:
 *   parameters:
 *     AuthHeader:
 *       name: Authorization
 *       in: header
 *       description: Bearer token for authentication
 *       required: true
 *       schema:
 *         type: string
 *         format: "Bearer <token>"
 *
 * /api/company/update-company-profile/:
 *   put:
 *     summary: Update company profile
 *     description: Endpoint to update the company profile including colors, social media images, and company logos.
 *     tags:
 *       - Company
 *     parameters:
 *       - $ref: '#/components/parameters/AuthHeader'
 *     security:
 *       - BearerAuth: []  # Enforcing the need for a Bearer token
 *     requestBody:
 *       description: Company profile details to be updated.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primary_Color:
 *                 type: string
 *                 description: Primary color of the company profile.
 *                 example: "#123456"
 *               primary_Font_Color:
 *                 type: string
 *                 description: Primary font color for the company.
 *                 example: "#FFFFFF"
 *               primary_Gradient_Color:
 *                 type: string
 *                 description: Gradient color for the primary section.
 *                 example: "#ABCDEF"
 *               secondary_Color:
 *                 type: string
 *                 description: Secondary color of the company profile.
 *                 example: "#654321"
 *               secondary_Font_Color:
 *                 type: string
 *                 description: Secondary font color for the company.
 *                 example: "#123ABC"
 *               secondary_Gradient_Color:
 *                 type: string
 *                 description: Gradient color for the secondary section.
 *                 example: "#FEDCBA"
 *               social_Media_Images:
 *                 type: boolean
 *                 description: Whether to include social media images in the company profile.
 *                 example: true
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: New logo for the company (optional file upload).
 *               companyBanner:
 *                 type: string
 *                 format: binary
 *                 description: New banner for the company (optional file upload).
 *     responses:
 *       '200':
 *         description: Successfully updated the company profile.
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
 *                   example: "Updated successfully"
 *       '400':
 *         description: Bad request - Invalid input or missing data.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal server error - Failed to update the profile.
 */

router.put(
  "/update-company-profile/:id",
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
 * /api/company/profile/reset-to-default:
 *   put:
 *     summary: Reset company profile to default settings
 *     description: Endpoint to reset the company profile settings to their default values. Requires a valid Bearer token.
 *     tags:
 *       - Company
 *     parameters:
 *       - $ref: '#/components/parameters/AuthHeader'
 *     security:
 *       - BearerAuth: []  # Enforcing the need for a Bearer token
 *     responses:
 *       '200':
 *         description: Successfully reset the company profile to default settings.
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
 *                   example: "Company profile reset to default successfully."
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to perform this action.
 *       '500':
 *         description: Internal server error - Unable to reset the company profile.
 */

router.get(
  "/profile/reset-to-default",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL("companyAdmin"),
  companyController.resetTodefauldCompanyProfiles
);

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
