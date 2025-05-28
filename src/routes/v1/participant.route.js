"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const participant_controller_1 = __importDefault(require("../../controllers/participant.controller"));
const participant_validation_1 = __importDefault(require("../../validations/participant.validation"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(), (0, validate_1.default)(participant_validation_1.default.createParticipant), participant_controller_1.default.createParticipant);
router.get("/", (0, auth_1.default)(), participant_controller_1.default.getAllParticipants);
router
    .route("/:id")
    .get(participant_controller_1.default.getParticipantById)
    .post((0, validate_1.default)(participant_validation_1.default.updateParticipant), participant_controller_1.default.updateParticipant)
    .delete(participant_controller_1.default.deleteParticipant);
exports.default = router;
