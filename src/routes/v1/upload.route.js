"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = __importDefault(require("../../controllers/upload.controller"));
const router = (0, express_1.Router)();
router.get("/:fileName", upload_controller_1.default.getUploadedFile);
exports.default = router;
