import express from "express";
import validate from "../../middlewares/validate";
import adminValidate from "../../validations/admin.validation";
import { adminController } from "../../controllers";
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
  "/roles/:roleId/permissions/revoke",
  auth(),
  checkPermission("delete_system_setting"),
  validate(adminValidate.assignPermissionsToRoleSchema),
  adminController.revokePermissionFromRole
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

export default router;
