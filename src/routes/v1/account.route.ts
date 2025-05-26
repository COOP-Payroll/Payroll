import express from "express";
import accountController from "../../controllers/account.controller";
import { upload } from "../../config/multer";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import accountValidation from "../../validations/account.validation";
import multer from "multer";

const router = express.Router();

router
  .route("/")
  .post(auth(), upload.array("letter"), accountController.createAccount)
  .get(auth(), accountController.getAllAccounts);

router
  .route("/:id")
  .get(auth(), accountController.getAccountById)
  .post(auth(), upload.single("letter"), accountController.updateAccount);

router.post("/delete/:id", auth(), accountController.deleteAccount);

router.post(
  "/assign-master/:id",

  auth(),
  upload.array("letter"),
  validate(accountValidation.assignMasterAccountSchema),
  accountController.assignMasterAccount
);
// router.post(
//   "/unassign-master/:id",
//   auth(),
//   accountController.unassignMasterAccount
// );

export default router;
