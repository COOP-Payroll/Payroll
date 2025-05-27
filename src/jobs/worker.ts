import { Worker } from "bullmq";
import { processPaymentJob } from "./payment-job";
import { PaymentJobData } from "../types/payment";
import logger from "../config/logger";

const worker = new Worker(
  "payment-processing",
  async (job) => {
    logger.info(`Processing job ${job.id} for bulkId: ${job.data.bulkId}`);
    await processPaymentJob(job.data as PaymentJobData);
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
    concurrency: 5,
  }
);

worker.on("active", (job) => {
  logger.info("I am ready to take jobs");
});

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  if (job) {
    logger.error(`Job ${job.id} failed`, {
      error: err.message,
      bulkId: job?.data.bulkId,
    });
  }
});

worker.on("error", (err) => {
  logger.error("Worker error", { error: err.message });
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
