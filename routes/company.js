const express = require("express");
const companyController = require("../controllers/companyController.js");
const upload = require("../middleware/multer");
const router = express.Router();
const middleware=require("../middleware/auth.js")

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


router.post("/set-password/:token", companyController.resetPasswordToken);
router.get('/get/companyprofile',
  middleware.protectAll, 
  companyController.getcompanyProfiles
);

router.put(
  "/update-company-profile/",
  middleware.protectAll,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  
  ]),
  companyController.updateCompanyProfile
);

router.put(
  "/update-account-info/",
  middleware.protectAll,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "referenceLetter", maxCount: 1 },
  
  ]),
  companyController.updateAccountInfo
);
router.put(
  "/:id",
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "header", maxCount: 1 },
    { name: "footer", maxCount: 1 },
  ]),
  companyController.updateCompany
);



router.put('/project/update/isProjectBased',
  middleware.protectAll, 
  companyController.updateProjectBased
)
router.delete("/:id", companyController.deleteCompany);
router.get("/all/activeCompany", companyController.getAllActiveCompany);
router.get("/all/blockedCompany", companyController.getAllBlockedCompany);
router.get("/all/deniedCompany", companyController.getAllDeniedCompany);
router.get("/all/pendingCompany", companyController.getAllPendingCompany);
router.get("/subscriptionLeftDate/:companyId", companyController.getSubscriptionLeftDate);


module.exports = router;
