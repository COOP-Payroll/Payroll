import { Job, Worker } from "bullmq";
import { processPaymentJob } from "./payment-job";
import { PaymentJobData } from "../types/payment";
import logger from "../config/logger";
import redisClient from "../queues/redis-client";

const paymentWorker = new Worker<PaymentJobData>(
  "payment-processing",
  async (job: Job<PaymentJobData>) => {
    try {
      logger.info(
        `Processing payment job ${job.id} for bulkId: ${job.data.bulkId}`
      );
      await processPaymentJob(job.data);
      console.info(`Payment job ${job.id} completed successfully`);
    } catch (error: any) {
      console.error(`Payment job ${job.id} failed`, {
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

paymentWorker.on("ready", () => {
  console.log("Payment Worker started!");
});

// paymentWorker.on("active", (job) => {
//   logger.info(`Payment worker active, processing job ${job.id}`);
// });

// paymentWorker.on("failed", (job, err) => {
//   if (job) {
//     logger.error(`Payment job ${job.id} failed`, {
//       bulkId: job.data.bulkId,
//       error: err.message,
//     });
//   }
// });

// paymentWorker.on("error", (err) => {
//   logger.error("Payment worker error", { error: err.message });
// });

// Graceful shutdown
process.on("SIGTERM", async () => {
  await paymentWorker.close();
  logger.info("Payment worker closed gracefully");
  process.exit(0);
});

export { paymentWorker };
