import { v4 as uuidv4 } from "uuid";
import httpStatus from "http-status";
import prisma from "../client";
import logger from "../config/logger";
import { AuthUser } from "../types/express";
import ApiError from "./api-error";
import { paymentQueue } from "../queues";
import { PaymentJobData, paymentJobSchema } from "../types/payment";

export async function createCampaignPayment(
  campaignId: string,
  user: AuthUser
) {
  const participants = await prisma.campaignParticipant.findMany({
    where: {
      campaignId,
      accountNumber: { not: null },
    },
    select: {
      id: true,
      totalAmount: true,
      accountNumber: true,
    },
  });

  console.log("participants", participants);

  if (!participants.length) {
    console.warn(`No approved participants found for campaign ${campaignId}`);
    return;
  }

  // Calculate total amount
  const totalAmount = participants.reduce(
    (sum: number, p: any) => sum + p.totalAmount,
    0
  );

  // Fetch master account
  const account = await prisma.account.findFirst({
    where: { companyId: user.companyId, isMaster: true, isActive: true },
    select: { accountNumber: true },
  });

  if (!account) {
    console.error(
      `No active master account found for company ${user.companyId}`
    );
    throw new ApiError(httpStatus.NOT_FOUND, "Master account not found");
  }

  // Prepare payment job
  const paymentJobData: PaymentJobData = {
    debitAccount: account.accountNumber,
    totalAmount,
    bulkId: uuidv4(),
    creditTransactions: participants.map((p: any) => ({
      orderId: uuidv4(),
      creditAccount: p.accountNumber!,
      amount: p.totalAmount,
      campaignParticipantId: p.id,
    })),
    campaignId,
  };

  try {
    const parsedData = paymentJobSchema.parse(paymentJobData);
    console.log("Parsed payment job data:", parsedData);
    const job = await paymentQueue.add("create-payment", parsedData, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
    logger.info(`Payment job queued for campaign ${campaignId}`, {
      bulkId: parsedData.bulkId,
      jobId: job.id,
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Payment processing failed"
    );
  }
}
