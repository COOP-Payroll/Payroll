
const express = require("express");
const companyController = require("../controllers/companyController.js");
const upload = require("../middleware/multer");
const router = express.Router();

/**
 * @swagger
 * /company:
 *   post:
 *     summary: Add a list of Companys
 *     description: Returns a list of Company
 *     responses:
 *       200:
 *         description: Successful response
 */
router.post(
  "/",
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "companyBanner", maxCount: 1 },
    { name: "acctImage", maxCount: 1 },
  ]),
  companyController.createCompany
);
/**
 * @swagger
 * /company:
 *   get:
 *     summary: Get a list of Companys
 *     description: Returns a list of Company
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get("/", companyController.getAllCompany);
router.get("/:id", companyController.getCompanyById);
router.post("/", companyController.createCompany);
router.put(
  "/:id",
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "header", maxCount: 1 },
    { name: "footer", maxCount: 1 },
  ]),
  companyController.updateCompany
);
router.delete("/:id", companyController.deleteCompany);
router.get("/all/activeCompany", companyController.getAllActiveCompany);
router.get("/all/blockedCompany", companyController.getAllBlockedCompany);
router.get("/all/deniedCompany", companyController.getAllDeniedCompany);
router.get("/all/pendingCompany", companyController.getAllPendingCompany);
router.get("/subscriptionLeftDate/:companyId", companyController.getSubscriptionLeftDate);


module.exports = router;
