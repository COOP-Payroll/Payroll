"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../../controllers");
const validate_1 = __importDefault(require("../../middlewares/validate"));
const company_validation_1 = __importDefault(require("../../validations/company.validation"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post("/register", (0, validate_1.default)(company_validation_1.default.createCompany), controllers_1.companyController.registerCompany);
router.get("/profile", (0, auth_1.default)(), controllers_1.companyController.getCompany);
router.post("/update", (0, auth_1.default)(), (0, validate_1.default)(company_validation_1.default.updateCompany), controllers_1.companyController.updateCompany);
exports.default = router;
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
