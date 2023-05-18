const express = require("express");
const router = express.Router();
const middleware=require('../middleware/auth.js')
const departmentController = require("../controllers/department.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  departmentController.getAllDepartment
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  departmentController.createDepartment
);
router.delete("/:id", departmentController.deleteDepartment);
router.put("/:id", departmentController.updateDepartment);
router.get("/:id", departmentController.getDepartmentById);

module.exports = router;
