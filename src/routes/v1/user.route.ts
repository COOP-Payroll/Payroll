import express from 'express';
import validate from '../../middlewares/validate';
import {userController} from '../../controllers'
import userValidation from '../../validations/user.validation';


const router = express.Router();


router.post('/', validate(userValidation.createUser), userController.createUser)




export default router;