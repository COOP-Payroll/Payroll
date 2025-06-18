import { Server } from "http";
import app from "./app";
import prisma from "./client";
import config from "./config/config";
import logger from "./config/logger";

let server: Server;
prisma.$connect().then(() => {
  console.log("Connected to SQL Database");
  server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error("Unexpected error:", error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  if (server) {
    server.close();
  }
});
