import express from "express";
import departmentController from "../../controllers/department.controller";
import adminValidate from "../../validations/admin.validation";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
import validate from "../../middlewares/validate";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    checkPermission("create_system_setting"),
    validate(adminValidate.createDepartmentSchema),
    departmentController.createDepartment
  )
  .get(
    auth(),
    checkPermission("view_system_setting"),
    departmentController.getAllDepartments
  );

router
  .route("/:id")
  .get(
    auth(),
    checkPermission("view_system_setting"),
    validate(adminValidate.getDepartmentSchema),
    departmentController.getDepartmentById
  )
  .post(
    auth(),
    checkPermission("update_system_setting"),
    validate(adminValidate.updateDepartmentSchema),
    departmentController.updateDepartment
  )
  .delete(
    auth(),
    checkPermission("delete_system_setting"),
    validate(adminValidate.getDepartmentSchema),
    departmentController.deleteDepartment
  );

export default router;
