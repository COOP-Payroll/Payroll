import express from 'express';
import validate from '../../middlewares/validate';
import authValidation from '../../validations/auth.validation';
import { adminController } from '../../controllers';


const router = express.Router();

router.route('/roles')
      .post(adminController.createRole)
      .get(adminController.getRoles)

router.route('/permissions')
      .get(adminController.getAllPermissions)


export default router