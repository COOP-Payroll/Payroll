const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
// const { accountInfoMulter, upload } = require("../middleware/multer.js");
const newEmployeeController = require("../controllers/newEmployeeControllers.js");

router.get(
  "/",

  middleware.protectAll,
  middleware.restrictALL({ moduleName: "employlist", isAccessible: true }),
  employeeController.getAllEmployee
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "employlist", isAccessible: true }),
  employeeController.getEmployeeById
);
router.post(
  "/",
  upload.fields([
    { name: "basicInfo[image]", maxCount: 1 },
    { name: "basicInfo[id_image]", maxCount: 1 },
    { name: "accountInformation[0][image]", maxCount: 1 },
    { name: "accountInformation[1][image]", maxCount: 1 },
    { name: "accountInformation[2][image]", maxCount: 1 },
  ]),
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  // employeeController.createEmployee
  newEmployeeController.createEmployee
);

router.get(
  "/company/employees",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "employlist", isAccessible: true }),
  newEmployeeController.getAllEmployee
);

router.get(
  "/department/:departmentId",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "employlist", isAccessible: true }),
  employeeController.findByDepartment
);

router.put(
  "/additionalPay/:id",
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  employeeController.addAddionalPay
);
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmployee
);
router.put(
  "/promotion/:id",

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.promotion
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),

  employeeController.deleteEmployee
);
//payrollpublish
//payrollpublishedreport
//reports
router.post(
  "/excel",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  employeeController.createEmployeeFile
);

router.post("/login", employeeController.login);

router.get("/confirm/:id", newEmployeeController.confirmaRegistration);

module.exports = router;
