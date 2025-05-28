"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const department_controller_1 = __importDefault(require("../../controllers/department.controller"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const checkPermissions_1 = require("../../middlewares/checkPermissions");
const admin_validation_1 = __importDefault(require("../../validations/admin.validation"));
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(), 
// checkPermission("create_system_setting"),
(0, validate_1.default)(admin_validation_1.default.createDepartmentSchema), department_controller_1.default.createDepartment)
    .get((0, auth_1.default)(), 
// checkPermission("view_system_setting"),
department_controller_1.default.getAllDepartments);
router
    .route("/:id")
    .get((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), (0, validate_1.default)(admin_validation_1.default.getDepartmentSchema), department_controller_1.default.getDepartmentById)
    .post((0, auth_1.default)(), 
// checkPermission("update_system_setting"),
(0, validate_1.default)(admin_validation_1.default.updateDepartmentSchema), department_controller_1.default.updateDepartment)
    .delete((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("delete_system_setting"), (0, validate_1.default)(admin_validation_1.default.getDepartmentSchema), department_controller_1.default.deleteDepartment);
exports.default = router;
