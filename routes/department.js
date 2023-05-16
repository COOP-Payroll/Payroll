const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/department.js");

// Define routes for handling User requests
router.get("/", departmentController.getAllDepartment);
router.post("/", departmentController.createDepartment);
router.delete("/:id", departmentController.deleteDepartment);
router.put("/:id", departmentController.updateDepartment);
router.get("/:id", departmentController.getDepartmentById);

module.exports = router;
