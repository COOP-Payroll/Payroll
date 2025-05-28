"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx_1 = __importDefault(require("xlsx"));
const campaignparticipantvalidation_1 = require("../validations/campaignparticipantvalidation");
const api_error_1 = __importDefault(require("../utils/api-error"));
const parseAndValidateExcel = (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return next(new api_error_1.default(400, 'No file uploaded.'));
        }
        const filePath = file.path;
        const workbook = xlsx_1.default.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx_1.default.utils.sheet_to_json(sheet, { defval: '' }); // empty cells become ''
        req.body.participants = data;
        req.body.filePath = filePath;
        (0, campaignparticipantvalidation_1.validateParticipants)(data, filePath);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = parseAndValidateExcel;
