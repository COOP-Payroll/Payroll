import express from "express";
import validate from "../../middlewares/validate";
import adminValidate from "../../validations/admin.validation";
import workflowValidation from "../../validations/workflow.validation";
import { adminController } from "../../controllers";
import { workflowController } from "../../controllers";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router.get(
  "/active",
  auth(),
  //   checkPermission("view_system_setting"),

  workflowController.getActiveWorkflowForCurrentUser
);

export default router;
