import { Queue } from "bullmq";
import config from "./config/config";

// add prisma to the NodeJS global type
interface CustomMQGlobal extends Global {
  paymentQueue: Queue;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomMQGlobal;

const paymentQueue =
  global.paymentQueue ||
  new Queue("payment-processing", {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  });

if (config.env === "development") global.paymentQueue = paymentQueue;

export default paymentQueue;
