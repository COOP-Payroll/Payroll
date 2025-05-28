import express from "express";
import { companyController } from "../../controllers";
import validate from "../../middlewares/validate";
import companyValidation from "../../validations/company.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/register",
  validate(companyValidation.createCompany),
  companyController.registerCompany
);
router.get("/profile", auth(), companyController.getCompany);
router.post(
  "/update",
  auth(),
  validate(companyValidation.updateCompany),
  companyController.updateCompany
);

export default router;

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register as company
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - email
 *               - phoneNumber
 *               - companyCode
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               organizationName:
 *                 type: string
 *                 format: string
 *                 minLength: 8
 *                 description: add organization name
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               organizationName: fakehealth
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 */
