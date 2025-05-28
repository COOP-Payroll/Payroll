"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fileFilter = (_req, file, cb) => {
    // Reject files that might be executable
    const dangerousExtensions = [".exe", ".bat", ".sh", ".php", ".js", ".jar"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (dangerousExtensions.includes(ext)) {
        return cb(new Error("File type not allowed"), false);
    }
    cb(null, true);
};
// Ensure the upload directory exists
const uploadDir = path_1.default.join(__dirname, "..", "uploads", "documents");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    // filename: (_req, file, cb) => {
    //   const ext = path.extname(file.originalname);
    //   const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
    //   cb(null, uniqueName);
    // },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname +
            "-" +
            uniqueSuffix +
            "." +
            file.originalname.split(".").pop());
    },
});
exports.upload = (0, multer_1.default)({ storage });
