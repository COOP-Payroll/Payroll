import express from 'express';
import validate from '../../middlewares/validate';
import {userController} from '../../controllers'
import userValidation from '../../validations/user.validation';


const router = express.Router();

router.route('/')
      .post(validate(userValidation.createUser), userController.createUser)
      .get(validate(userValidation.getUsers), userController.getUsers);

export default router;