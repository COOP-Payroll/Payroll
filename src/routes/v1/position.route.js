"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const position_controller_1 = __importDefault(require("../../controllers/position.controller"));
const validate_1 = __importDefault(require("../../middlewares/validate"));
const position_validation_1 = __importDefault(require("../../validations/position.validation"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.default)(), (0, validate_1.default)(position_validation_1.default.createPosition), position_controller_1.default.createPosition)
    .get((0, auth_1.default)(), position_controller_1.default.getAllPositions);
router
    .route("/:id")
    .get((0, auth_1.default)(), position_controller_1.default.getPositionById)
    .post((0, auth_1.default)(), (0, validate_1.default)(position_validation_1.default.updatePosition), position_controller_1.default.updatePosition)
    .delete((0, auth_1.default)(), position_controller_1.default.deletePosition);
exports.default = router;
