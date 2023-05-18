const express = require("express");
const companyIdRouter = require("../controllers/companyIdFormat");

const router = express.Router();
// const companyIdController = require("../controllers/companyIdFormat");
// const middleware = require("../middleware/auth");

// const router = express.Router();

router.post("/", companyIdRouter.createCompanyIdFormat);
router.get("/", companyIdRouter.getAllCompanyIdFormat);
// router.get("/:id", companyController.getCompanyById);
// router.put("/:id", companyController.updateCompany);
// router.delete("/:id", companyController.deleteCompany);

module.exports = router;
