const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportingControllers.js");

router.get('/project-salary-report', reportController.generateProjectSalaryReport);
router.get('/payroll-published-report', reportController.getPayrollPublishedReport);


module.exports = router;