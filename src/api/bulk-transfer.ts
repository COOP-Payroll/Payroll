import httpStatus from "http-status";
import { z } from "zod";
import prisma from "../client";
import logger from "../config/logger";
import {
  BulkTransferRequest,
  BulkTransferRequestSchema,
  BulkTransferResponse,
  BulkTransferResponseSchema,
} from "../types/payment";
import ApiError from "../utils/api-error";
import { apiClient } from "../utils/api-client";
import { statusCheckQueue } from "../queues";
import config from "../config/config";
import { PaymentType } from "@prisma/client";

export async function sendBulkTransfer(
  campaignId: string
): Promise<BulkTransferResponse> {
  const payment = await prisma.payment.findUnique({
    where: { campaignId },
    include: { creditTransactions: true },
  });

  if (!payment) {
    logger.info(`Payment for campaign ID ${campaignId} not found`);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment for campaign ID ${campaignId} not found`
    );
  }

  const requestBody: BulkTransferRequest = {
    debitAccount: payment.debitAccount,
    totalAmount: Number(payment.totalAmount),
    bulkId: payment.bulkId,
    creditTransactions: payment.creditTransactions.map((txn, index) => ({
      orderId: txn.orderId,
      creditAccount: txn.creditAccount,
      amount: Number(txn.amount),
    })),
  };

  try {
    BulkTransferRequestSchema.parse(requestBody);
    const response = await apiClient.post(
      "/submit?priority=HIGH",
      requestBody
    );

    const data = BulkTransferResponseSchema.parse(response.data);

    await prisma.payment.update({
      where: { id: payment.id },
      data: { jobId: data.jobId, status: PaymentType.PENDING },
    });

    await statusCheckQueue.add(
      "check-statuss",
      { jobId: data.jobId, paymentId: payment.id, retryCount: 0 },
      { delay: config.pollingIntervalMs }
    );

    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error("Invalid request or response data");
    }
    console.error("Error sending bulk transfer:", error);
    throw new Error("Failed to initiate bulk transfer");
  }
}
