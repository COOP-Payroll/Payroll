"use strict";
// import { Request, Response } from 'express';
// import httpStatus from 'http-status';
// import mime from 'mime-types';
// import path from 'path';
// import catchAsync from '../utils/catch-async';
// import uploadService from '../services/upload.service';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const mime_types_1 = __importDefault(require("mime-types"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const upload_service_1 = __importDefault(require("../services/upload.service"));
const getUploadedFile = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = decodeURIComponent(req.params.fileName);
    const doc = yield upload_service_1.default.getDocumentByOriginalName(fileName);
    if (!doc) {
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "File not found in database" });
        return;
    }
    const absoluteFilePath = path_1.default.resolve(__dirname, "../../src/uploads/documents", doc.filePath);
    if (!fs_1.default.existsSync(absoluteFilePath)) {
        console.error(`File not found at path: ${absoluteFilePath}`);
        res
            .status(http_status_1.default.NOT_FOUND)
            .send({ message: "File not found on disk" });
        return;
    }
    const stat = fs_1.default.statSync(absoluteFilePath);
    const fileStream = fs_1.default.createReadStream(absoluteFilePath);
    const mimeType = doc.mimeType || mime_types_1.default.lookup(doc.fileName) || "application/octet-stream";
    const extension = path_1.default.extname(doc.fileName).toLowerCase();
    const forceDownloadTypes = [
        ".pdf",
        ".xlsx",
        ".xls",
        ".doc",
        ".docx",
        ".ppt",
        ".pptx",
    ];
    const isInline = !forceDownloadTypes.includes(extension);
    const safeFileName = path_1.default.basename(doc.fileName).replace(/[\n\r]/g, "");
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `${isInline ? "inline" : "attachment"}; filename="${safeFileName}"`);
    fileStream.on("error", (err) => {
        console.error("File stream error:", err);
        res
            .status(http_status_1.default.INTERNAL_SERVER_ERROR)
            .send({ message: "Error reading file stream" });
    });
    fileStream.pipe(res);
}));
exports.default = {
    getUploadedFile,
};
