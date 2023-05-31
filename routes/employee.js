const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
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
  upload.single("images"),
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

router.put(
  "/additionalPay/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.addAddionalPay
);
router.put(
  "/:id",

  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),

  employeeController.deleteEmployee
);

router.post(
  "/excel",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.createEmployeeFile
);


router.post(
  "/login",
  employeeController.login
);

module.exports = router;
