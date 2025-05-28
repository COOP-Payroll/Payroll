"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const controllers_1 = require("../../controllers");
const user_validation_1 = __importDefault(require("../../validations/user.validation"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(), (0, validate_1.default)(user_validation_1.default.createUser), controllers_1.userController.createUser)
    .get((0, auth_1.default)(), (0, validate_1.default)(user_validation_1.default.getUsers), controllers_1.userController.getUsers);
router
    .route("/:userId")
    .get((0, auth_1.default)(), (0, validate_1.default)(user_validation_1.default.getUserSchema), controllers_1.userController.getUserById);
exports.default = router;
