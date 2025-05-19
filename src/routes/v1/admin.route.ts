import express from "express";
import validate from "../../middlewares/validate";
import adminValidate from "../../validations/admin.validation";
import { adminController } from "../../controllers";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router.use(auth());

router
  .route("/roles")
  .post(
    // checkPermission("")
    validate(adminValidate.createPermissionsToRoleSchema),
    adminController.createAssignPermissionToRoles
  )
  .get(adminController.getRoles);

router.route("/permissions").get(adminController.getAllPermissions);

router.post(
  "/roles/:roleId/permissions",
  validate(adminValidate.assignPermissionsToRoleSchema),
  adminController.assignPermissionToRoles
);
router.post(
  "/roles/:roleId/permissions/revoke",
  validate(adminValidate.assignPermissionsToRoleSchema),
  adminController.revokePermissionFromRole
);
router.post(
  "/roles/assignToUsers",
  validate(adminValidate.assignRoleToUserSchema),
  adminController.assignRoleToUser
);
router.post(
  "/roles/revokeFromUsers",
  validate(adminValidate.assignRoleToUserSchema),
  adminController.revokeRoleFromUser
);

export default router;
