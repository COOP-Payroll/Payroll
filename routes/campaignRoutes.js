const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const middleware = require("../middleware/auth.js");
router.post("/", campaignController.createCampaign);
router.get("/", middleware.protectAll, campaignController.getAllCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.put("/:id", campaignController.updateCampaign);
router.delete("/:id", campaignController.deleteCampaign);

module.exports = router;
