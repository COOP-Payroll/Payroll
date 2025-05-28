"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_controller_1 = __importDefault(require("../../controllers/account.controller"));
const multer_1 = require("../../config/multer");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const account_validation_1 = __importDefault(require("../../validations/account.validation"));
const router = express_1.default.Router();
router.post("/verify", (0, auth_1.default)(), account_controller_1.default.verifyAccountController);
router
    .route("/")
    .post((0, auth_1.default)(), multer_1.upload.array("letter"), account_controller_1.default.createAccount)
    .get((0, auth_1.default)(), account_controller_1.default.getAllAccounts);
router
    .route("/:id")
    .get((0, auth_1.default)(), account_controller_1.default.getAccountById)
    .post((0, auth_1.default)(), multer_1.upload.single("letter"), account_controller_1.default.updateAccount);
router.post("/delete/:id", (0, auth_1.default)(), account_controller_1.default.deleteAccount);
router.post("/verify-status/:id", (0, auth_1.default)(), (0, validate_1.default)(account_validation_1.default.updateAccountVerificationSchema), account_controller_1.default.updateAccountVerification);
router.post("/assign-master/:id", (0, auth_1.default)(), multer_1.upload.array("letter"), (0, validate_1.default)(account_validation_1.default.assignMasterAccountSchema), account_controller_1.default.assignMasterAccount);
// router.post(
//   "/unassign-master/:id",
//   auth(),
//   accountController.unassignMasterAccount
// );
exports.default = router;
