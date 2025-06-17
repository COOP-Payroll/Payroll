import { Job, Worker } from "bullmq";
import { z } from "zod";
import prisma from "../client";
import config from "../config/config";
import redisClient from "../queues/redis-client";
import {
  BulkTransferResponseSchema,
  WebhookPayloadSchema,
} from "../types/payment";
import { apiClient } from "../utils/api-client";
import { statusCheckQueue } from "../queues";

export const statusCheckWorker = new Worker(
  "status-check",
  async (job: Job) => {
    const { jobId, paymentId, retryCount } = job.data;

    try {
      const response = await apiClient.get(
        `/api/async-fund-transfer/status/${jobId}`
      );
      console.log("Status check response:", response.data);
      const status = WebhookPayloadSchema.parse(response.data);
      // Update payment status in database
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          updatedAt: new Date(),
          progressPercentage: status.progressPercentage,
        },
      });

      if (status.status === "COMPLETED" || status.status === "FAILED") {
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
