const express = require("express");
const middleware = require("../middleware/auth");
const employeeAccountController = require("../controllers/EmployeeAccountInfo");
const upload = require("../middleware/multer");

const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  employeeAccountController.getAllEmployeeAccountInfo
);
router.post(
  "/",
  upload.fields([{ name: "image", maxCount: 1 }]),
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  employeeAccountController.createEmployeeAccountInfo
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  employeeAccountController.deleteEmployeeAccountInfo
);
router.put(
  "/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  employeeAccountController.updateEmployeeAccountInfo
);

module.exports = router;
