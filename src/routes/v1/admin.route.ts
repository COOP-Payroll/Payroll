import express from 'express';
import validate from '../../middlewares/validate';
import adminValidate from '../../validations/admin.validation';
import { adminController } from '../../controllers';


const router = express.Router();

router.route('/roles')
      .post(validate(adminValidate.createPermissionsToRoleSchema), adminController.createAssignPermissionToRoles)
      .get(adminController.getRoles)

router.route('/permissions')
      .get(adminController.getAllPermissions)

router.post('/roles/:roleId/permissions', validate(adminValidate.assignPermissionsToRoleSchema), adminController.assignPermissionToRoles)
router.post('/roles/:roleId/permissions/revoke', validate(adminValidate.assignPermissionsToRoleSchema), adminController.revokePermissionFromRole)


export default router