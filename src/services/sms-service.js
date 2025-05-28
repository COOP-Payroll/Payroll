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
exports.sendSMS = sendSMS;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../config/logger"));
function sendSMS(phoneNumber, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = {
                SMSGateway_Request: {
                    ESBHeader: {
                        serviceCode: "330000",
                        channel: "USSD",
                        Service_name: "SMSGateway",
                        Message_Id: (0, uuid_1.v4)(),
                    },
                    SMSGateway: {
                        Mobile: phoneNumber,
                        Text: message,
                    },
                },
            };
            const result = yield axios_1.default.post(config_1.default.smsAPIURL, payload);
            logger_1.default.info("SMS sent successfully", result.data);
        }
        catch (error) {
            const smsError = new Error(`Failed to send SMS: ${error.message}`);
            smsError.code = error.code || "SMS_PROVIDER_ERROR";
            logger_1.default.error("error sending sms", smsError);
            throw smsError;
        }
    });
}
