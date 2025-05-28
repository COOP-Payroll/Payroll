"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const campaign_controller_1 = __importDefault(require("../../controllers/campaign.controller"));
const multer_1 = require("../../config/multer");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(), multer_1.upload.array("documents"), campaign_controller_1.default.createCampaign)
    .get((0, auth_1.default)(), campaign_controller_1.default.getAllCampaigns);
router.get("/status", (0, auth_1.default)(), campaign_controller_1.default.getCampaignsByStatus);
router
    .route("/:id")
    .get((0, auth_1.default)(), campaign_controller_1.default.getCampaignById)
    .put((0, auth_1.default)(), multer_1.upload.array("documents"), campaign_controller_1.default.updateCampaign);
router.post("/delete/:id", (0, auth_1.default)(), campaign_controller_1.default.deleteCampaign);
// router.post("/document/:id", auth(), campaignController.deleteDocumentsByQuery);
router.post("/process/:id", (0, auth_1.default)(), campaign_controller_1.default.processCampaign);
exports.default = router;
