import express from "express";
import validate from "../../middlewares/validate";
import adminValidate from "../../validations/admin.validation";
import workflowValidation from "../../validations/workflow.validation";
import { adminController } from "../../controllers";
import { workflowController } from "../../controllers";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

// router.use(auth());

router
  .route("/roles")
  .post(
    auth(),
    checkPermission("create_system_setting"),
    validate(adminValidate.createPermissionsToRoleSchema),
    adminController.createAssignPermissionToRoles
  )
  .get(
    auth(),
    checkPermission("view_system_setting"),
    adminController.getRoles
  );

router.get(
  "/roles/name",
  auth(),
  checkPermission("view_system_setting"),
  adminController.getRoleWithOutPermission
);

router.post(
  "/roles/approval",
  auth(),
  checkPermission("create_system_setting"),
  validate(adminValidate.createRoleSchema),
  adminController.createRole
);

router
  .route("/permissions")
  .get(
    auth(),
    checkPermission("view_system_setting"),
    adminController.getAllPermissions
  );

router.post(
  "/roles/:roleId/permissions",
  auth(),
  checkPermission("update_system_setting"),
  validate(adminValidate.assignPermissionsToRoleSchema),
  adminController.assignPermissionToRoles
);
router.post(
  "/roles/:roleId/permissions/change",
  auth(),
  checkPermission("create_system_setting"),
  validate(adminValidate.assignPermissionsToRoleSchema),
  adminController.updatePermissionFromRole
);
router.post(
  "/roles/assignToUsers",
  auth(),
  checkPermission("create_system_setting"),
  validate(adminValidate.assignRoleToUserSchema),
  adminController.assignRoleToUser
);
router.post(
  "/roles/revokeFromUsers",
  auth(),
  checkPermission("delete_system_setting"),
  validate(adminValidate.assignRoleToUserSchema),
  adminController.revokeRoleFromUser
);

router.post(
  "/workflow",
  auth(),
  checkPermission("create_system_setting"),
  validate(workflowValidation.createWorkFlowSchema),
  workflowController.createWorkflow
);

router.get(
  "/workflow/active",
  auth(),
  checkPermission("view_system_setting"),
  workflowController.getActiveWorkflow
);

router.get(
  "/workflow/history",
  auth(),
  checkPermission("view_system_setting"),
  workflowController.getWorkflowHistory
);

router.get(
  "/workflow/active/stageUsers/:workFlowId",
  auth(),
  checkPermission("view_system_setting"),
  validate(workflowValidation.getStageUserActiveWorkflowSchema),
  workflowController.getStageUserActiveWorkflow
);

export default router;
