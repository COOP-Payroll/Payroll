const express = require("express");
const companyController = require("../controllers/companyController.js");

const router = express.Router();

router.post("/", companyController.createCompany);
router.get("/", companyController.getAllCompany);
router.get("/:id", companyController.getCompanyById);
router.post("/:", companyController.createCompany);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

module.exports = router;
