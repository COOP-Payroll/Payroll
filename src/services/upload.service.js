"use strict";
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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = __importDefault(require("../client"));
const getDocumentByOriginalName = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    // Replace with actual Prisma query
    const document = yield client_1.default.document.findFirst({
        where: {
            filePath: fileName,
        },
    });
    console.log("dfhadsjfhdsjj");
    console.log(fileName);
    console.log(document);
    if (!document)
        return null;
    return {
        fileName: document.fileName,
        filePath: document.filePath,
        // mimeType: document.mimeType // Make sure this field exists in your schema
    };
});
const getFileStream = (filePath) => {
    try {
        const fullPath = path_1.default.resolve(filePath);
        // Check if file exists
        if (!fs_1.default.existsSync(fullPath)) {
            console.error(`File not found at path: ${fullPath}`);
            return null;
        }
        return fs_1.default.createReadStream(fullPath);
    }
    catch (error) {
        console.error("Error creating read stream:", error);
        return null;
    }
};
exports.default = {
    getDocumentByOriginalName,
    getFileStream,
};
