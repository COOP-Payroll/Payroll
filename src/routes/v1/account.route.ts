import express from "express";
import accountController from "../../controllers/account.controller";
import { upload } from "../../config/multer";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(auth(), upload.single("letter"), accountController.createAccount)
  .get(auth(), accountController.getAllAccounts);

router
  .route("/:id")
  .get(auth(), accountController.getAccountById)
  .post(auth(), upload.single("letter"), accountController.updateAccount);

router.post("/delete/:id", auth(), accountController.deleteAccount);

export default router;
