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
exports.processPaymentJob = processPaymentJob;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../client"));
const logger_1 = __importDefault(require("../config/logger"));
function processPaymentJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const participant = yield client_2.default.campaignParticipant.findUnique({
                where: { id: data.participantId },
            });
            if (!participant) {
                throw new Error(`Participant with ID ${data.participantId} not found`);
            }
            yield client_2.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const payment = yield tx.payment.create({
                    data: {
                        debitAccount: data.debitAccount,
                        totalAmount: data.totalAmount,
                        bulkId: data.bulkId,
                        participantId: data.participantId,
                    },
                });
                yield tx.creditTransaction.createMany({
                    data: data.creditTransactions.map((tx) => ({
                        orderId: tx.orderId,
                        creditAccount: tx.creditAccount,
                        amount: tx.amount,
                        status: client_1.TransactionStatus.PENDING,
                        paymentId: payment.id,
                    })),
                });
            }));
            logger_1.default.info(`Payment created successfully for bulkId: ${data.bulkId}`);
        }
        catch (error) {
            logger_1.default.error("Error processing payment job", {
                error,
                bulkId: data.bulkId,
            });
            throw error;
        }
    });
}
