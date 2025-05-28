"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentJobSchema = void 0;
const zod_1 = require("zod");
exports.paymentJobSchema = zod_1.z.object({
    debitAccount: zod_1.z.string().min(1, "Debit account is required"),
    totalAmount: zod_1.z.number().positive("Total amount must be positive"),
    bulkId: zod_1.z.string().min(1, "Bulk ID is required"),
    participantId: zod_1.z.string().min(1, "Participant ID is required"),
    creditTransactions: zod_1.z
        .array(zod_1.z.object({
        orderId: zod_1.z.string().min(1, "Order ID is required"),
        creditAccount: zod_1.z.string().min(1, "Credit account is required"),
        amount: zod_1.z.number().positive("Amount must be positive"),
    }))
        .min(1, "At least one credit transaction is required"),
});
