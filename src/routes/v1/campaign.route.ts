
import express from "express";
import campaignController from "../../controllers/campaign.controller";
import { upload } from "../../config/multer";

const router = express.Router();

router
  .route("/")
  .post(upload.array("documents"), campaignController.createCampaign)
  .get(campaignController.getAllCampaigns);

// router
//   .route("/file/:fileName")
//   .get(campaignController.getDocumentByName);

router
  .route("/:id")
  .put(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

export default router;
