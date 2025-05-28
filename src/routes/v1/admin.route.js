"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const admin_validation_1 = __importDefault(require("../../validations/admin.validation"));
const workflow_validation_1 = __importDefault(require("../../validations/workflow.validation"));
const controllers_1 = require("../../controllers");
const controllers_2 = require("../../controllers");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const checkPermissions_1 = require("../../middlewares/checkPermissions");
const router = express_1.default.Router();
// router.use(auth());
router
    .route("/roles")
    .post((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_system_setting"), (0, validate_1.default)(admin_validation_1.default.createPermissionsToRoleSchema), controllers_1.adminController.createAssignPermissionToRoles)
    .get((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), controllers_1.adminController.getRoles);
router.get("/roles/name", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), controllers_1.adminController.getRoleWithOutPermission);
router.post("/roles/approval", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_system_setting"), (0, validate_1.default)(admin_validation_1.default.createRoleSchema), controllers_1.adminController.createRole);
router
    .route("/permissions")
    .get((0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), controllers_1.adminController.getAllPermissions);
router.post("/roles/:roleId/permissions", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("update_system_setting"), (0, validate_1.default)(admin_validation_1.default.assignPermissionsToRoleSchema), controllers_1.adminController.assignPermissionToRoles);
router.post("/roles/:roleId/permissions/change", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_system_setting"), (0, validate_1.default)(admin_validation_1.default.assignPermissionsToRoleSchema), controllers_1.adminController.updatePermissionFromRole);
router.post("/roles/assignToUsers", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_system_setting"), (0, validate_1.default)(admin_validation_1.default.assignRoleToUserSchema), controllers_1.adminController.assignRoleToUser);
router.post("/roles/revokeFromUsers", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("delete_system_setting"), (0, validate_1.default)(admin_validation_1.default.assignRoleToUserSchema), controllers_1.adminController.revokeRoleFromUser);
router.post("/workflow", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("create_system_setting"), (0, validate_1.default)(workflow_validation_1.default.createWorkFlowSchema), controllers_2.workflowController.createWorkflow);
router.get("/workflow/active", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), controllers_2.workflowController.getActiveWorkflow);
router.get("/workflow/history", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), controllers_2.workflowController.getWorkflowHistory);
router.get("/workflow/active/stageUsers/:workFlowId", (0, auth_1.default)(), (0, checkPermissions_1.checkPermission)("view_system_setting"), (0, validate_1.default)(workflow_validation_1.default.getStageUserActiveWorkflowSchema), controllers_2.workflowController.getStageUserActiveWorkflow);
exports.default = router;
