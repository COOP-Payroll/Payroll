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
exports.smsWorker = void 0;
const bullmq_1 = require("bullmq");
const logger_1 = __importDefault(require("../config/logger"));
const redis_client_1 = __importDefault(require("../queues/redis-client"));
const sms_service_1 = require("../services/sms-service");
const smsWorker = new bullmq_1.Worker("sms-queue", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, message, jobId, type } = job.data;
    try {
        if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
            throw new Error("Invalid phone number format");
        }
        if (message.length > 160) {
            throw new Error("Message exceeds 160 characters");
        }
        yield (0, sms_service_1.sendSMS)(phoneNumber, message);
        logger_1.default.info(`SMS job ${jobId} ${type} sent successfully to ${phoneNumber}`);
    }
    catch (error) {
        logger_1.default.error(`SMS job ${jobId} ${type} failed for ${phoneNumber}`, {
            error: error,
            retryCount: job.attemptsMade + 1,
        });
        throw error;
    }
}), {
    connection: redis_client_1.default,
    concurrency: 10,
    limiter: {
        max: 100,
        duration: 1000,
    },
});
exports.smsWorker = smsWorker;
smsWorker.on("active", (job) => {
    logger_1.default.info(`SMS worker active, processing job ${job.id} (${job.data.type})`);
});
smsWorker.on("failed", (job, err) => {
    if (job) {
        logger_1.default.error(`SMS job ${job.id} (${job.data.type}) failed`, {
            phoneNumber: job.data.phoneNumber,
            error: err.message,
        });
    }
});
smsWorker.on("error", (err) => {
    logger_1.default.error("SMS worker error", { error: err.message });
});
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield smsWorker.close();
    logger_1.default.info("SMS worker closed gracefully");
    process.exit(0);
}));
