import { z } from "zod";

export const paymentJobSchema = z.object({
  debitAccount: z.string().min(1, "Debit account is required"),
  totalAmount: z.number().positive("Total amount must be positive"),
  bulkId: z.string().min(1, "Bulk ID is required"),

  creditTransactions: z
    .array(
      z.object({
        orderId: z.string().min(1, "Order ID is required"),
        creditAccount: z.string().min(1, "Credit account is required"),
        amount: z.number().positive("Amount must be positive"),
        campaignParticipantId: z.string().min(1, "Participant ID is required"),
      })
    )
    .min(1, "At least one credit transaction is required"),
  campaignId: z.string().min(1, "Participant ID is required"),
});

export const CreditTransactionSchema = z.object({
  orderId: z.string(),
  creditAccount: z.string(),
  amount: z.number().positive(),
});

export const BulkTransferRequestSchema = z.object({
  debitAccount: z.string(),
  totalAmount: z.number().positive(),
  bulkId: z.string(),
  creditTransactions: z.array(CreditTransactionSchema),
});

export const BulkTransferResponseSchema = z.object({
  jobId: z.string().uuid(),
  bulkId: z.string(),
  status: z.string(),
  message: z.string(),
  submittedAt: z.string(),
  totalTransactions: z.number().int().nonnegative(),
  statusCheckUrl: z.string().optional(),
});

export const TransactionResultSchema = z.object({
  orderId: z.string(),
  transactionId: z.string().nullable(),
  status: z.enum(["SUCCESS", "FAILED"]),
  message: z.string().nullable(),
  processedAt: z.string().nullable(),
});

export const WebhookPayloadSchema = z.object({
  jobId: z.string().uuid(),
  bulkId: z.string(),
  status: z.string(),
  message: z.string(),
  submittedAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  totalTransactions: z.number().int().nonnegative(),
  processedTransactions: z.number().int().nonnegative(),
  successfulTransactions: z.number().int().nonnegative(),
  failedTransactions: z.number().int().nonnegative(),
  progressPercentage: z.number().min(0).max(100),
  transactionResults: z.array(TransactionResultSchema),
});

export type PaymentJobData = z.infer<typeof paymentJobSchema>;

export type BulkTransferRequest = z.infer<typeof BulkTransferRequestSchema>;
export type BulkTransferResponse = z.infer<typeof BulkTransferResponseSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
