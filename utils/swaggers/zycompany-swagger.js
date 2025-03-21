/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Create a new company
 *     description: Creates a new company with the provided details such as company code, organization name, phone number, and email. Validates required fields and checks for existing company before creation.
 *     tags:
 *       - CompanyData
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyCode
 *               - organizationName
 *               - phoneNumber
 *               - email
 *               - regionId
 *               - accountNumber
 *             properties:
 *               companyCode:
 *                 type: string
 *                 description: Unique code for the company
 *                 example: "COMP1234"
 *               organizationName:
 *                 type: string
 *                 description: Name of the organization
 *                 example: "My Company"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the company
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 description: Email address of the company
 *                 example: "company@example.com"
 *               regionId:
 *                 type: integer
 *                 description: ID of the region where the company is located
 *                 example: 1
 *               zoneId:
 *                 type: integer
 *                 description: ID of the zone (optional)
 *                 example: 5
 *               woredaId:
 *                 type: integer
 *                 description: ID of the woreda (optional)
 *                 example: 2
 *               accountNumber:
 *                 type: string
 *                 description: Unique account number for the company
 *                 example: "1234567890"
 *     responses:
 *       '201':
 *         description: Company created successfully
 *       '400':
 *         description: Bad request - Missing required fields or invalid data
 *       '404':
 *         description: Not found - Region, zone, or woreda not found
 *       '409':
 *         description: Conflict - Email or companyCode already exists
 *       '503':
 *         description: Service unavailable - Server error
 */
