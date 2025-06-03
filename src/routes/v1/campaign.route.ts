import express, { NextFunction, Request, Response } from "express";
import campaignController from "../../controllers/campaign.controller";
import { upload } from "../../config/multer";
import auth from "../../middlewares/auth";

import campaignparticipantvalidation from "../../validations/campaignparticipantvalidation";
import validate from "../../middlewares/validate";
import campaignValidation from "../../validations/campaign.validation";
import { checkPermission } from "../../middlewares/checkPermissions";
import { multerErrorHandler } from "../../middlewares/multerErrorHandler";
import ApiError from "../../utils/api-error";
import { HttpStatusCode } from "axios";
import multer from "multer";

const router = express.Router();
// router.post(
//   "/process/:id",
//   auth(),
//   upload.array("documents"),

//   multerErrorHandler,
//   campaignController.processCampaign
// );

const uploadHandler = (req: Request, res: Response, next: NextFunction) => {
  upload.array("documents")(req, res, function (err: any) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error("Unknown error:", err);
      return res.status(500).json({ error: "Unexpected error occurred." });
    }
    next();
  });
};
router.post(
  "/process/:id",
  auth(),
  uploadHandler,
  campaignController.processCampaign
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

  .post(auth(), upload.array("documents"), campaignController.createCampaign)
  .get(auth(), campaignController.getAllCampaigns);

router.get("/status", auth(), campaignController.getCampaignsByStatus);

router
  .route("/:id")
  .get(auth(), campaignController.getCampaignById)
  .put(auth(), upload.array("documents"), campaignController.updateCampaign);

router.post("/delete/:id", auth(), campaignController.deleteCampaign);

router.post(
  "/document",

  validate(campaignValidation.deleteDocument),
  auth(),
  campaignController.deleteDocument
);

router.post("/document/:id", auth(), campaignController.deleteDocumentsByQuery);

export default router;
