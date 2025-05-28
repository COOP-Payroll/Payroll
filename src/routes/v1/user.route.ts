import express from "express";
import validate from "../../middlewares/validate";
import { userController } from "../../controllers";
import userValidation from "../../validations/user.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(auth(), validate(userValidation.createUser), userController.createUser)
  .get(auth(), validate(userValidation.getUsers), userController.getUsers);

router
  .route("/:userId")
  .get(
    auth(),
    validate(userValidation.getUserSchema),
    userController.getUserById
  );

export default router;
