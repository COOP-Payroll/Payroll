const express = require("express");
const router = express.Router();
const taxslabController = require("../controllers/taxslab.js");

const middleware = require("../middleware/auth.js");
/**
 * @swagger
 * /api/taxslab:
 *   get:
 *     summary: Get all tax slabs
 *     description: Retrieves all tax slabs for the authenticated user. Accessible by both superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of tax slabs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from_Salary:
 *                     type: integer
 *                     description: The starting salary for the tax slab.
 *                   to_Salary:
 *                     type: integer
 *                     description: The ending salary for the tax slab.
 *                   income_tax_payable:
 *                     type: number
 *                     format: float
 *                     description: The payable income tax for the tax slab.
 *                   deductible_Fee:
 *                     type: number
 *                     format: float
 *                     description: The deductible fee for the tax slab.
 *                   remark:
 *                     type: string
 *                     description: Additional remarks for the tax slab.
 *       '400':
 *         description: Bad Request - Invalid input or insufficient permissions.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   post:
 *     summary: Create a new tax slab
 *     description: Creates a new tax slab based on the provided salary range and tax details. Accessible by superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_Salary:
 *                 type: integer
 *                 description: The starting salary for the tax slab.
 *                 example: 50000
 *               to_Salary:
 *                 type: integer
 *                 description: The ending salary for the tax slab (use "Infinity" for no upper limit).
 *                 example: 100000
 *               income_tax_payable:
 *                 type: number
 *                 format: float
 *                 description: The income tax payable for the given salary range.
 *                 example: 5000
 *               deductible_Fee:
 *                 type: number
 *                 format: float
 *                 description: The deductible fee for the given salary range.
 *                 example: 1000
 *               remark:
 *                 type: string
 *                 description: Additional remarks for the tax slab.
 *                 example: "Remark about this slab"
 *     responses:
 *       '200':
 *         description: Successfully created the tax slab.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 taxslab:
 *                   type: object
 *                   properties:
 *                     from_Salary:
 *                       type: integer
 *                       description: The starting salary for the tax slab.
 *                     to_Salary:
 *                       type: integer
 *                       description: The ending salary for the tax slab.
 *                     income_tax_payable:
 *                       type: number
 *                       format: float
 *                       description: The income tax payable for the tax slab.
 *                     deductible_Fee:
 *                       type: number
 *                       format: float
 *                       description: The deductible fee for the tax slab.
 *                     remark:
 *                       type: string
 *                       description: Additional remarks for the tax slab.
 *       '400':
 *         description: Bad Request - Tax slab already defined or invalid input.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/taxslab/{id}:
 *   get:
 *     summary: Get tax slab by ID
 *     description: Retrieves the details of a specific tax slab by its ID. Accessible by both superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the tax slab to retrieve.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the tax slab.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from_Salary:
 *                   type: integer
 *                   description: The starting salary for the tax slab.
 *                 to_Salary:
 *                   type: integer
 *                   description: The ending salary for the tax slab.
 *                 income_tax_payable:
 *                   type: number
 *                   format: float
 *                   description: The income tax payable for the tax slab.
 *                 deductible_Fee:
 *                   type: number
 *                   format: float
 *                   description: The deductible fee for the tax slab.
 *                 remark:
 *                   type: string
 *                   description: Additional remarks for the tax slab.
 *       '400':
 *         description: Bad Request - Invalid tax slab ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   put:
 *     summary: Update tax slab by ID
 *     description: Updates an existing tax slab based on the provided ID. Accessible by superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the tax slab to update.
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_Salary:
 *                 type: integer
 *                 description: The starting salary for the tax slab.
 *               to_Salary:
 *                 type: integer
 *                 description: The ending salary for the tax slab.
 *               income_tax_payable:
 *                 type: number
 *                 format: float
 *                 description: The payable income tax for the tax slab.
 *               deductible_Fee:
 *                 type: number
 *                 format: float
 *                 description: The deductible fee for the tax slab.
 *               remark:
 *                 type: string
 *                 description: Additional remarks for the tax slab.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully updated the tax slab.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 taxslab:
 *                   type: object
 *                   properties:
 *                     from_Salary:
 *                       type: integer
 *                       description: The starting salary for the tax slab.
 *                     to_Salary:
 *                       type: integer
 *                       description: The ending salary for the tax slab.
 *                     income_tax_payable:
 *                       type: number
 *                       format: float
 *                       description: The income tax payable for the tax slab.
 *                     deductible_Fee:
 *                       type: number
 *                       format: float
 *                       description: The deductible fee for the tax slab.
 *                     remark:
 *                       type: string
 *                       description: Additional remarks for the tax slab.
 *       '400':
 *         description: Bad Request - Invalid input or tax slab not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   delete:
 *     summary: Delete tax slab by ID
 *     description: Deletes a specific tax slab by its ID. Accessible by superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the tax slab to delete.
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the tax slab.
 *       '400':
 *         description: Bad Request - Invalid tax slab ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/restoreTodefault/tax:
 *   put:
 *     summary: Restore tax slabs to default for the company
 *     description: Restores tax slabs to their default values for a specific company. Accessible by superAdmin and companyAdmin.
 *     tags:
 *       - Tax Slabs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully restored tax slabs to default values.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating that tax slabs were restored.
 *                 deletedData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the deleted tax slab.
 *                       from_Salary:
 *                         type: integer
 *                         description: The starting salary for the tax slab.
 *                       to_Salary:
 *                         type: integer
 *                         description: The ending salary for the tax slab.
 *                       income_tax_payable:
 *                         type: number
 *                         format: float
 *                         description: The income tax payable for the tax slab.
 *                       deductible_Fee:
 *                         type: number
 *                         format: float
 *                         description: The deductible fee for the tax slab.
 *                       CompanyId:
 *                         type: integer
 *                         description: The company ID to which the tax slab is associated.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the restored tax slab.
 *                       from_Salary:
 *                         type: integer
 *                         description: The starting salary for the tax slab.
 *                       to_Salary:
 *                         type: integer
 *                         description: The ending salary for the tax slab.
 *                       income_tax_payable:
 *                         type: number
 *                         format: float
 *                         description: The income tax payable for the tax slab.
 *                       deductible_Fee:
 *                         type: number
 *                         format: float
 *                         description: The deductible fee for the tax slab.
 *                       CompanyId:
 *                         type: integer
 *                         description: The company ID to which the tax slab is associated.
 *       '400':
 *         description: Bad Request - Invalid input or tax slabs could not be restored.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions (superAdmin, companyAdmin).
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

// Define routes for handling User requests
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.getAllTaxslabs
);

router.get(
  "/tax/:id",
  middleware.validateUserAgent,
  taxslabController.getCompanyWITHtAXSLAB
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.createTaxslab
);
router.delete(
  "/:id",
  middleware.validateUserAgent,
  taxslabController.deleteTaxslab
);
router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateTaxslab
);

router.put(
  "/updateMany/tax",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.updateMany
);

//RESTORE TO DEFAULT

router.put(
  "/restoreTodefault/tax",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  taxslabController.restoreToDefault
);

router.get(
  "/:id",
  middleware.validateUserAgent,
  taxslabController.getTaxslabById
);

module.exports = router;
