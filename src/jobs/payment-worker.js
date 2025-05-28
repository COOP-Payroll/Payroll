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
exports.paymentWorker = void 0;
const bullmq_1 = require("bullmq");
const payment_job_1 = require("./payment-job");
const logger_1 = __importDefault(require("../config/logger"));
const redis_client_1 = __importDefault(require("../queues/redis-client"));
// const worker = new Worker(
//   "payment-processing",
//   async (job) => {
//     logger.info(`Processing job ${job.id} for bulkId: ${job.data.bulkId}`);
//     await processPaymentJob(job.data as PaymentJobData);
//   },
//   {
//     connection: {
//       host: "localhost",
//       port: 6379,
//     },
//     concurrency: 5,
//   }
// );
const paymentWorker = new bullmq_1.Worker("payment-processing", (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info(`Processing payment job ${job.id} for bulkId: ${job.data.bulkId}`);
        yield (0, payment_job_1.processPaymentJob)(job.data);
        logger_1.default.info(`Payment job ${job.id} completed successfully`);
    }
    catch (error) {
        logger_1.default.error(`Payment job ${job.id} failed`, {
            bulkId: job.data.bulkId,
            error: error.message,
        });
        throw error;
    }
}), {
    connection: redis_client_1.default,
    concurrency: 5,
});
exports.paymentWorker = paymentWorker;
paymentWorker.on("active", (job) => {
    logger_1.default.info(`Payment worker active, processing job ${job.id}`);
});
paymentWorker.on("failed", (job, err) => {
    if (job) {
        logger_1.default.error(`Payment job ${job.id} failed`, {
            bulkId: job.data.bulkId,
            error: err.message,
        });
    }
});
paymentWorker.on("error", (err) => {
    logger_1.default.error("Payment worker error", { error: err.message });
});
// Graceful shutdown
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentWorker.close();
    logger_1.default.info("Payment worker closed gracefully");
    process.exit(0);
}));
