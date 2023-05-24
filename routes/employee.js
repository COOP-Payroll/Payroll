const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
router.get(
  "/",

  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.getAllEmployee
);
router.get(
  "/:id",

  employeeController.getEmployeeById
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),

  employeeController.createEmployee
);


router.get(
  "/department/:departmentId",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.findByDepartment
);
router.put("/:id", employeeController.updateEmployee);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),

  employeeController.deleteEmployee
);

module.exports = router;
