const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");

router.post(
  "/",

  upload.fields([{ documents: "basicInfo[image]", maxCount: 10 }]),

  campaignController.createCampaign
);
router.get("/", middleware.protectAll, campaignController.getAllCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.put("/:id", campaignController.updateCampaign);
router.delete("/:id", campaignController.deleteCampaign);

module.exports = router;
