import express from 'express';
import departmentController from '../../controllers/department.controller';

const router = express.Router();

router
  .route('/')
  .post(departmentController.createDepartment)
  .get(departmentController.getAllDepartments);

router
  .route('/:id')
  .get(departmentController.getDepartmentById)
  .post(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

export default router;
