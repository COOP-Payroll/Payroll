import express from "express";
// import { registerCampaignParticipant } from "../../controllers/campaignparticipant.controller";
import { upload } from "../../config/multer";
import campaignParticipantController from "../../controllers/campaingparticipant.controller";
import auth from "../../middlewares/auth";
import { validateParticipants } from "../../validations/campaignparticipantvalidation";
import parseAndValidateExcel  from '../../middlewares/parseAndValidateExcel';


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
  upload.array("documents"), 
  campaignParticipantController.updateCampaignParticipant
);


router.get(
  "/participants",
  campaignParticipantController.getParticipantsByCampaignId
);

router.get(
  "/published",
  campaignParticipantController.getAllPublishedCampaigns
);

router.get(
  "/approved",
  campaignParticipantController.getAllApprovedCampaigns
);

router.get(
  "/download-template",
  // auth(),
  campaignParticipantController.downloadParticipantTemplate
);

router.post(
  "/bulk/:id",

  upload.single("file"),
  auth(),
  campaignParticipantController.registerBulkCampaignParticipants
);

export default router;
