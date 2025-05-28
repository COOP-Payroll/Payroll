"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsQueue = exports.paymentQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_client_1 = __importDefault(require("./redis-client"));
exports.paymentQueue = (_a = global.paymentQueue) !== null && _a !== void 0 ? _a : new bullmq_1.Queue("payment-processing", {
    connection: redis_client_1.default,
});
exports.smsQueue = (_b = global.smsQueue) !== null && _b !== void 0 ? _b : new bullmq_1.Queue("sms-queue", {
    connection: redis_client_1.default,
});
if (!global.paymentQueue)
    global.paymentQueue = exports.paymentQueue;
if (!global.smsQueue)
    global.smsQueue = exports.smsQueue;
