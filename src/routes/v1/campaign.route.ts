import express, { NextFunction, Request, Response } from "express";
import campaignController from "../../controllers/campaign.controller";
import { multipleImageUpload, upload } from "../../config/multer";
import auth from "../../middlewares/auth";

import campaignparticipantvalidation from "../../validations/campaignparticipantvalidation";
import validate from "../../middlewares/validate";
import campaignValidation from "../../validations/campaign.validation";
import { checkPermission } from "../../middlewares/checkPermissions";
import { multerErrorHandler } from "../../middlewares/multerErrorHandler";
import ApiError from "../../utils/api-error";
import { HttpStatusCode } from "axios";
import multer from "multer";

const safeUpload = (req: Request, res: Response, next: NextFunction) => {
  console.log("request +++++++   dddddd", req.files);
  multipleImageUpload(req, res, function (err) {
    console.log("dkddkdk");
    if (err instanceof multer.MulterError) {
      console.log("------  multer", err);
      // A Multer error occurred (like file too large)

      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Unknown error
      console.log("another error", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log("passed!");
    next();
  });
};
const router = express.Router();
router.post(
  "/process/:id",
  auth(),
  safeUpload,

  (req, res, next) => {
    console.log("Middleware passed11");
    next();
  },
  campaignController.processCampaign
);
router.post(
  "/document",
  auth(),
  // validate(campaignValidation.deleteDocument),
  campaignController.deleteDocumentsByQuery
);
// router.post(
//   "/process/:id",
//   auth(), // ✅ Authentication middleware

//   (req, res, next) => {
//     console.log("🚦 Step 2: Multer starting");

//     upload.array("documents")(req, res, function (err) {
//       console.log("🔄 Inside multer callback");

//       if (err) {
//         console.error("❌ Multer error1:", err);
//         return res.status(400).json({ message: err.message });
//       }

//       console.log("✅ Step 3: Multer finished.");
//       console.log("📁 Uploaded files:", req.files);
//       console.log("📝 Request body:", req.body);

//       next();
//     });
//   },

//   (req, _res, next) => {
//     console.log("🚦 Step 4: After multer");
//     next();
//   },

//   campaignController.processCampaign // ✅ Final controller
// );
router
  .route("/")

  .post(
    auth(),
    upload.array("documents"),
    validate(campaignValidation.createCampaign),
    campaignController.createCampaign
  );

router.route("/").get(auth(), campaignController.getAllCampaigns);

router.get("/status", auth(), campaignController.getCampaignsByStatus);
router.get("/fetch/status", auth(), campaignController.fetchCampaignsByStatus);

router
  .route("/:id")
  .get(auth(), campaignController.getCampaignById)
  .post(auth(), upload.array("documents"), campaignController.updateCampaign);

router.post("/delete/:id", auth(), campaignController.deleteCampaign);

// router.post("/document/:id", auth(),
// campaignController.deleteDocumentsByQuery);

export default router;
