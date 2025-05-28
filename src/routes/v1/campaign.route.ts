import express from "express";
import campaignController from "../../controllers/campaign.controller";
import { upload } from "../../config/multer";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(auth(), upload.array("documents"), campaignController.createCampaign)
  .get(auth(), campaignController.getAllCampaigns);

router.get("/status", auth(), campaignController.getCampaignsByStatus);

router
  .route("/:id")
  .get(auth(), campaignController.getCampaignById)
  .put(auth(), upload.array("documents"), campaignController.updateCampaign);

router.post("/delete/:id", auth(), campaignController.deleteCampaign);

// router.post("/document/:id", auth(), campaignController.deleteDocumentsByQuery);

router.post("/process/:id", auth(), campaignController.processCampaign);

export default router;
