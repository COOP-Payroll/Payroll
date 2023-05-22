const express = require("express");
const payroll = require("../controllers/payrollController");
const middleware = require("../middleware/auth");
<<<<<<< HEAD
=======

>>>>>>> 3405f716c94d163ff52dee6724b2da0b7b23c3aa
const router = express.Router();

router.get("/", payroll.getAllPayrollByCompanyId);
router.post(
  "/",
  middleware.protectAll,
<<<<<<< HEAD
  middleware.restrictTo("companyAdmin"),
=======
  middleware.restrictToAdmin("companyAdmin"),
>>>>>>> 3405f716c94d163ff52dee6724b2da0b7b23c3aa
  payroll.createPayroll
);

module.exports = router;
