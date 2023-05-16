const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();

router.get("/", employeeController.getAllEmployee);
router.get("/:id", employeeController.getEmployeeById);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
