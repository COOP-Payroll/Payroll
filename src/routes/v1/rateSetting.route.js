"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateSetting_controller_1 = __importDefault(require("../../controllers/rateSetting.controller"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(), 
// validate(rateSettingValidation.createRateSetting),
rateSetting_controller_1.default.createRateSetting);
router.get("/", (0, auth_1.default)(), rateSetting_controller_1.default.getAllRateSettings);
router.route("/:id").post((0, auth_1.default)(), rateSetting_controller_1.default.updateRateSetting);
exports.default = router;
