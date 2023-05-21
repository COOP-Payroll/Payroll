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
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  upload.single("image"),
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
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  employeeAccountController.updateEmployeeAccountInfo
);

module.exports = router;
