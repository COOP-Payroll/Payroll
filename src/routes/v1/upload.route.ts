import { Router } from "express";
import uploadController from "../../controllers/upload.controller";

const router = Router();

router.get("/:fileName", uploadController.getUploadedFile);

export default router;
