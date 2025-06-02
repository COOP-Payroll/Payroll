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

const router = express.Router();

router
  .route("/")

  .post(
    auth(),

    upload.array("documents"),
    campaignController.createCampaign
  )
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

// router.post("/document/:id", auth(), campaignController.deleteDocumentsByQuery);

// router.post(
//   "/process/:id",
//   auth(),
//   (next: NextFunction) => {
//     console.log(">> Route hit, before multer");
//     next();
//   },
//   upload.array("documents"),
//   (next: NextFunction) => {
//     console.log(">> After multer, files:");
//     next();
//   },
//   multerErrorHandler,
//   (next: NextFunction) => {
//     console.log(">> After multerdddd, files:");
//     next();
//   },
//   campaignController.processCampaign
// );

router.post(
  "/process/:id",
  auth(),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(">> Route hit, before multer");
    next();
  },

  (req: Request, res: Response, next: NextFunction) => {
    upload.array("documents")(req, res, (err: any) => {
      if (err) {
        console.error("Multer error:", err);
        return next(new ApiError(400, err.message));
      }
      next();
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    console.log(">> After multer, files:", req.files);
    console.log(">> Request body:", req.body);
    next();
  },
  // upload.array("documents"),
  // (req: Request, res: Response, next: NextFunction) => {
  //   console.log(">> After multer, files:", req.files);
  //   next();
  // },
  multerErrorHandler,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(">> After multerdddd, files:");
    next();
  },
  campaignController.processCampaign
);

export default router;
