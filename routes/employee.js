const express = require("express");
const employeeController = require("../controllers/employeeControllers.js");
const router = express.Router();
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
// const { accountInfoMulter, upload } = require("../middleware/multer.js");
const newEmployeeController = require("../controllers/newEmployeeControllers.js");

router.put(
  "/unassign-approver/:id",
  middleware.validateUserAgent,
  middleware.protectAll,

  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.UnAssignApprovers
);
router.put(
  "/update-contact-info/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.updateContactInfo
);
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getAllEmployee
);
router.get(
  "/employees-with-custom-role",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getEmployeeWithCustomRole
);
router.get(
  "/get-all-projects/:employeeId",

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.getAllProjectEmployeeInvolded
);

router.get(
  "/download-excel",

  // middleware.protectAll,
  // middleware.restrictALL({
  //   moduleName: "employeeinfo",
  //   isAccessible: true,
  // }),
  newEmployeeController.downloadEmployeeTemplate
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
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
    moduleName: "EmployeeList",
    isAccessible: true,
  }),
  // employeeController.createEmployee
  newEmployeeController.createEmployee
);

router.get(
  "/company/employees",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  newEmployeeController.getAllEmployee
);

router.get(
  "/current-project/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  employeeController.employeesCurrentProject
);
router.get(
  "/previous-project/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  employeeController.employeesPreviousProject
);

router.get(
  "/employee-history/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  newEmployeeController.getEmployeeHistory
);
router.get(
  "/department/:departmentId",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({ moduleName: "EmployeeList", isAccessible: true }),
  employeeController.findByDepartment
);

router.put(
  "/additionalPay/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  employeeController.addAddionalPay
);

// router.put(
//   "/updateBasicInfo/:id",
//   upload.fields([
//     // { name: "image", maxCount: 1 },
//     { name: "id_image", maxCount: 1 },
//   ]),

//   middleware.protectAll,
//   middleware.restrictALL({
//     moduleName: "employeeinfo",
//     isAccessible: true,
//   }),
//   newEmployeeController.updatedBasicInfo
// );

router.put(
  "/update-basic-info/:id",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updatedBasicInfo
);

router.put(
  "/update-termination-status/:id",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateTermination
);

router.put(
  "/update-emergency-info/:employeeId",
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmergencyContact
);
router.put(
  "/update-account-info/:employeeId",
  middleware.validateUserAgent,
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "accountImage", maxCount: 1 },
  ]),

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateAccountInfo
);

router.put(
  "/update-employee-info/:id",
  middleware.validateUserAgent,
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
  "/update-employement-info/:id",
  // upload.fields([
  //   { name: "image", maxCount: 1 },
  //   { name: "id_image", maxCount: 1 },
  // ]),

  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  newEmployeeController.updateEmployementInfo
);

router.put(
  "/promotion/:id",

  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictALL({
    moduleName: "employeeinfo",
    isAccessible: true,
  }),
  upload.fields([{ name: "letter", maxCount: 1 }]),
  newEmployeeController.promotion
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
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
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  employeeController.createEmployeeFile
);

router.post(
  "/login",
  middleware.validateUserAgent,
  newEmployeeController.employeeLogin
);

router.post(
  "/register/bulk",
  middleware.validateUserAgent,

  middleware.protectAll,
  upload.fields([{ name: "file", maxCount: 1 }]),
  newEmployeeController.bulkRegister
);

router.get(
  "/confirm/:id",
  middleware.validateUserAgent,
  newEmployeeController.confirmaRegistration
);

module.exports = router;
