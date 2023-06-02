const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
router.get(
  "/",

  middleware.protectAll,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getAllEmployee
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getEmployeeById
);
router.post(
  "/",
  upload.single("images"),
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "EmployeeInformation",
    isAccessible: true,
  }),

  employeeController.createEmployee
);

router.get(
  "/department/:departmentId",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.findByDepartment
);

router.put(
  "/additionalPay/:id",
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "EmployeeInformation",
    isAccessible: true,
  }),
  employeeController.addAddionalPay
);
router.put(
  "/:id",

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "EmployeeInformation",
    isAccessible: true,
  }),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "EmployeeInformation",
    isAccessible: true,
  }),

  employeeController.deleteEmployee
);

router.post(
  "/excel",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.createEmployeeFile
);

router.post("/login", employeeController.login);

module.exports = router;
