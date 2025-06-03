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

const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
  console.log("🚦 Step 2: Multer starting");

  // Store the original response end function
  const originalEnd = res.end;

  upload.array("documents")(req, res, (err: any) => {
    console.log("🔄 Inside multer callback");

    if (err) {
      console.error("❌ Multer error:", err);

      // Handle specific error cases
      if (err.code === "ECONNRESET") {
        return res.status(499).json({ message: "Client closed connection" });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File too large" });
      }

      return res.status(400).json({ message: "File upload failed" });
    }

    console.log("✅ Step 3: Multer finished");
    console.log("📁 Uploaded files:", req.files?.length);

    // Restore original end function
    res.end = originalEnd;
    next();
  });

  // Handle connection termination
  req.on("aborted", () => {
    console.log("⚠️ Upload aborted by client");
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      console.log("⚠️ Connection closed prematurely");
    }
  });
};
const router = express.Router();
// router.post(
//   "/process/:id",
//   auth(),
//   upload.array("documents"),

//   multerErrorHandler,
//   campaignController.processCampaign
// );

router.post(
  "/process/:id",
  auth(),

  // Enhanced upload handler
  handleFileUpload,

  
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
