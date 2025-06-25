import { PaymentType, TransactionStatus } from "@prisma/client";
import { Job, Worker } from "bullmq";
import { z } from "zod";
import prisma from "../client";
import config from "../config/config";
import redisClient from "../queues/redis-client";
import { WebhookPayloadSchema } from "../types/payment";
import { apiClient } from "../utils/api-client";
import { statusCheckQueue } from "../queues";
import logger from "../config/logger";

export const statusCheckWorker = new Worker(
  "status-check",
  async (job: Job) => {
    const { jobId, paymentId, retryCount } = job.data;

    try {
      const response = await apiClient.get(
        `/status/${jobId}`
      );
      console.log("Status check response:", response.data);
      const data = WebhookPayloadSchema.parse(response.data);
      // Update payment status in database
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          updatedAt: new Date(),
          progressPercentage: data.progressPercentage,
        },
      });

      if (data.status === "COMPLETED" || data.status === "FAILED") {
        const existing = await prisma.payment.findFirst({
          where: { bulkId: data.bulkId, jobId: data.jobId },
          include: { creditTransactions: true },
        });

        if (!existing) {
          // throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
          logger.error(`Payment not found for ${data.bulkId}`);
          return;
        }

        if (existing.creditTransactions.some((txn) => txn.transactionId)) {
          logger.info(`webhook already processed ${data.bulkId}`);
          return;
          // return "webhook already processed";
        }

        // Update transactions
        await prisma.$transaction(async (tx) => {
          for (const result of data.transactionResults) {
            await tx.creditTransaction.update({
              where: { orderId: result.orderId },
              data: {
                status:
                  result.status === "SUCCESS"
                    ? TransactionStatus.PAID
                    : TransactionStatus.FAILED,
                transactionId:
                  result.status === "SUCCESS" ? result.transactionId : null,
                failureReason:
                  result.status === "FAILED" ? result.message : null,
                updatedAt: new Date(),
              },
            });
          }

          await tx.payment.update({
            where: { bulkId: data.bulkId },
            data: {
              updatedAt: new Date(),
              status:
                data.status === "FAILED"
                  ? PaymentType.FAILED
                  : PaymentType.COMPLETED,
            },
          });
        });
        // No further polling needed
        return;
      }

      // Schedule next status check
      await statusCheckQueue.add(
        "check-statuss",
        { jobId, paymentId, retryCount: 0 },
        { delay: config.pollingIntervalMs }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("----Status check validation error:", error.errors);
        return;
      }
      console.error("Error checking status:", error);
      if (retryCount < config.maxRetries) {
        // Retry with backoff
        await statusCheckQueue.add(
          "check-status",
          { jobId, paymentId, retryCount: retryCount + 1 },
          { delay: config.pollingIntervalMs * Math.pow(2, retryCount) }
        );
      } else {
        // Max retries reached, mark as failed
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            updatedAt: new Date(),
          },
        });
      }
    }
  },
  { connection: redisClient }
);

statusCheckWorker.on("ready", () => {
  console.log("Status Check Worker started!");
});
