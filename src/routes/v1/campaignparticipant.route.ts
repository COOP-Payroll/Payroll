import express from "express";
// import { registerCampaignParticipant } from "../../controllers/campaignparticipant.controller";
import { upload } from "../../config/multer";
import campaignParticipantController from "../../controllers/campaingparticipant.controller";

const router = express.Router();

router
  .route("/")
  .post(
    upload.array("documents"),
    campaignParticipantController.registerCampaignParticipant
  );

//   .get(campaignController.getAllCampaigns);

router.get(
  "/participants",
  campaignParticipantController.getParticipantsByCampaignId
);

router.get(
  "/published",
  campaignParticipantController.getAllPublishedCampaigns
);

router.get(
  "/campaigns/approved",
  campaignParticipantController.getAllApprovedCampaigns
);

export default router;
