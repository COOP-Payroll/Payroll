const express = require("express");
const companyController = require("../controllers/companyController.js");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/", upload.single("companyLogo"), companyController.createCompany);
router.get("/", companyController.getAllCompany);
router.get("/:id", companyController.getCompanyById);
router.post("/", companyController.createCompany);
router.put(
  "/:id",
  upload.single("companyLogo"),
  companyController.updateCompany
);
router.delete("/:id", companyController.deleteCompany);
router.get("/all/activeCompany", companyController.getAllActiveCompany);
router.get("/all/blockedCompany", companyController.getAllBlockedCompany);
router.get("/all/deniedCompany", companyController.getAllDeniedCompany);
router.get("/all/pendingCompany", companyController.getAllPendingCompany);

module.exports = router;
