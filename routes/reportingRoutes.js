const express = require("express");
const middleware = require("../middleware/auth");
const router = express.Router();

const reportController = require("../controllers/reportingControllers.js");

router.get('/project-salary-report', reportController.generateProjectSalaryReport);
router.get('/payroll-published-report',  middleware.protectAll,reportController.getPayrollPublishedReport);
router.get('/payroll-published-report/pdf', 
    middleware.protectAll,
    reportController.downloadExcelReport);
router.get("/payroll/monthly",reportController.getPayrollPublishedReportPerMonth);

router.get("/payroll-published-report-based-on-location",reportController.getPayrollPublishedReportBasedOnSiteLocation)


module.exports = router;