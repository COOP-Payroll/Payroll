import express from "express";
// import { registerCampaignParticipant } from "../../controllers/campaignparticipant.controller";
import { upload } from "../../config/multer";
import campaignParticipantController from "../../controllers/campaingparticipant.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    upload.array("documents"),
    campaignParticipantController.registerCampaignParticipant
  );

router.put(
  "/:id",
  auth(),
  upload.array("documents"), // same field name as frontend
  campaignParticipantController.updateCampaignParticipant
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

router.get(
  "/download-template",
  // auth(),
  campaignParticipantController.downloadParticipantTemplate
);

export default router;
