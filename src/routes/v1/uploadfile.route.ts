import express from "express";
import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { multipleImageUpload } from "../../config/test-multer";
import { heydeptController } from "../../controllers";

const router = express.Router();

const safeUpload = (req: Request, res: Response, next: NextFunction) => {
  multipleImageUpload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log("------  multer", err);
      // A Multer error occurred (like file too large)
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Unknown error
      console.log("another error", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    next();
  });
};

router.post(
  "/emails",
  //   authenticateJwt,
  // getEmailsValidator,
  // parseValidationResult,
  safeUpload,
  // multipleImageUpload,
  heydeptController.heydept
);

export default router;
