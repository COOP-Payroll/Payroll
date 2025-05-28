import { Job, Worker } from "bullmq";
import { processPaymentJob } from "./payment-job";
import { PaymentJobData } from "../types/payment";
import logger from "../config/logger";
import redisClient from "../queues/redis-client";

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

const paymentWorker = new Worker<PaymentJobData>(
  "payment-processing",
  async (job: Job<PaymentJobData>) => {
    try {
      logger.info(
        `Processing payment job ${job.id} for bulkId: ${job.data.bulkId}`
      );
      await processPaymentJob(job.data);
      logger.info(`Payment job ${job.id} completed successfully`);
    } catch (error: any) {
      logger.error(`Payment job ${job.id} failed`, {
        bulkId: job.data.bulkId,
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 5,
  }
);

paymentWorker.on("active", (job) => {
  logger.info(`Payment worker active, processing job ${job.id}`);
});

paymentWorker.on("failed", (job, err) => {
  if (job) {
    logger.error(`Payment job ${job.id} failed`, {
      bulkId: job.data.bulkId,
      error: err.message,
    });
  }
});

paymentWorker.on("error", (err) => {
  logger.error("Payment worker error", { error: err.message });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await paymentWorker.close();
  logger.info("Payment worker closed gracefully");
  process.exit(0);
});

export { paymentWorker };
