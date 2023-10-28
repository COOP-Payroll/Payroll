const express = require("express");
const middleware = require("../middleware/auth");
const EmployeePromotion = require("../controllers/EmployeePromotion.js");
const upload = require("../middleware/multer");

const router = express.Router();

router.get(
  "/:employeeId",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  EmployeePromotion.getEmployeePromotion
);
router.get(
  "/active/:employeeId",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  EmployeePromotion.getActiveEmployeePromotion
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  EmployeePromotion.createPromotion
);



module.exports = router;
