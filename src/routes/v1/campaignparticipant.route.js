"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { registerCampaignParticipant } from "../../controllers/campaignparticipant.controller";
const multer_1 = require("../../config/multer");
const campaingparticipant_controller_1 = __importDefault(require("../../controllers/campaingparticipant.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const campaignparticipantvalidation_1 = __importDefault(require("../../validations/campaignparticipantvalidation"));
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(), multer_1.upload.array("documents"), campaingparticipant_controller_1.default.registerCampaignParticipant);
router.put("/:id", (0, auth_1.default)(), multer_1.upload.array("documents"), campaingparticipant_controller_1.default.updateCampaignParticipant);
router.get("/participants", campaingparticipant_controller_1.default.getParticipantsByCampaignId);
router.get("/published", campaingparticipant_controller_1.default.getAllPublishedCampaigns);
router.get("/approved", campaingparticipant_controller_1.default.getAllApprovedCampaigns);
router.get("/download-template", 
// auth(),
campaingparticipant_controller_1.default.downloadParticipantTemplate);
router.post("/bulk/:id", multer_1.upload.single("file"), (0, auth_1.default)(), campaingparticipant_controller_1.default.registerBulkCampaignParticipants);
router.post("/verify-status/:id", (0, auth_1.default)(), (0, validate_1.default)(campaignparticipantvalidation_1.default.updateAccountVerificationSchema), campaingparticipant_controller_1.default.updateAccountVerification);
exports.default = router;
