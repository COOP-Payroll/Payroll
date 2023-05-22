const express = require("express");
const middleware = require("../middleware/auth");
const companyAccountController = require("../controllers/CompanyAccountInfo");
const upload = require("../middleware/multer");

const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  companyAccountController.getAllCompanyAccountInfo
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  upload.single("image"),
  companyAccountController.createCompanyAccountInfo
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  companyAccountController.deleteCompanyAccountInfo
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  companyAccountController.updateCompanyAccountInfo
);

router.get("/verify/account", companyAccountController.verifyAccountNumber);

module.exports = router;
