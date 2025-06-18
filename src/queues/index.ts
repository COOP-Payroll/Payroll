import { Queue } from "bullmq";
import redisClient from "./redis-client";

interface CustomMQGlobal extends Global {
  paymentQueue?: Queue;
  smsQueue?: Queue;
  statusCheckQueue?: Queue;
}

declare const global: CustomMQGlobal;

export const paymentQueue =
  global.paymentQueue ??
  new Queue("payment-processing", {
    connection: redisClient,
  });

export const smsQueue =
  global.smsQueue ??
  new Queue("sms-queue", {
    connection: redisClient,
  });

export const statusCheckQueue =
  global.statusCheckQueue ??
  new Queue("status-check", {
    connection: redisClient,
  });

if (!global.paymentQueue) global.paymentQueue = paymentQueue;
if (!global.smsQueue) global.smsQueue = smsQueue;
if (!global.statusCheckQueue) global.statusCheckQueue = statusCheckQueue;
