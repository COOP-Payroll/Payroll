import express from 'express';
import validate from '../../middlewares/validate';
import {userController} from '../../controllers'
import userValidation from '../../validations/user.validation';


const router = express.Router();

router.route('/')
      .post(validate(userValidation.createUser), userController.createUser)
      .get(validate(userValidation.getUsers), userController.getUsers);

// router
//   .route('/:userId')
//   .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)

export default router;