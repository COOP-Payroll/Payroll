const express = require("express");
const router = express.Router();
const middleware=require('../middleware/auth.js')
const departmentController = require("../controllers/department.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.getAllDepartment
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.createDepartment
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.deleteDepartment
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.updateDepartment
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  departmentController.getDepartmentById
);

module.exports = router;
