import express from 'express';
import validate from '../../middlewares/validate';
import adminValidate from '../../validations/admin.validation';
import { adminController } from '../../controllers';


const router = express.Router();

router.route('/roles')
      .post(adminController.createRole)
      .get(adminController.getRoles)

router.route('/permissions')
      .get(adminController.getAllPermissions)

router.post('/roles/:roleId/permissions', validate(adminValidate.assignPermissionsToRoleSchema), adminController.assignPermissionToRoles)


export default router