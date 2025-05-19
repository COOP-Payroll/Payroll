import express from "express";
import departmentController from "../../controllers/department.controller";
import departmentValidation from "../../validations/department.validation";
import validate from "../../middlewares/validate";

const router = express.Router();

router.post(
  "/",
  validate(departmentValidation.createDepartment),
  departmentController.createDepartment
);
router.route("/").get(departmentController.getAllDepartments);

router
  .route("/:id")
  .get(departmentController.getDepartmentById)
  .post(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

export default router;
