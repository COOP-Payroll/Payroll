import { z } from "zod";
import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import prisma from "../client";
import ApiError from "../utils/api-error";
import logger from "../config/logger";
import { sendBulkTransfer } from "../api/bulk-transfer";
import {
  PaymentJobData,
  paymentJobSchema,
  WebhookPayloadSchema,
} from "../types/payment";
import { PaymentType, TransactionStatus } from "@prisma/client";
import { paymentQueue } from "../queues";
import { AuthUser } from "../types/express";
import { createCampaignPayment } from "../utils/create-campaign-payment-";

export const getPaymentsByCampaignId = async (campaignId: string) => {
  // const payments = await prisma.payment.findUnique({
  //   where: { campaignId },
  //   select: {
  //     totalAmount: true,
  //     status: true,
  //     creditTransactions: {
  //       select: {
  //         amount: true,
  //         creditAccount: true,
  //         status: true,
  //         campaignParticipant: {
  //           select: {
  //             accountNumber: true,
  //             isVerified: true,
  //             paymentMethod: true,
  //             numberOfDaysInRural: true,
  //             numberOfDaysInUrban: true,
  //             totalAmount: true,
  //             participant: {
  //               select: {
  //                 fullName: true,
  //                 gender: true,
  //                 // phoneNumber: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     campaign: {
  //       select: { documents: true },
  //     },
  //   },
  // });

  // const totalParticipants = await prisma.campaignParticipant.count({
  //   where: { campaignId },
  // });
  const [payments, totalParticipants] = await Promise.all([
    prisma.payment.findUnique({
      where: { campaignId },
      select: {
        totalAmount: true,
        status: true,
        creditTransactions: {
          select: {
            amount: true,
            creditAccount: true,
            status: true,
            campaignParticipant: {
              select: {
                // accountNumber: true,
                isVerified: true,
                paymentMethod: true,
                numberOfDaysInRural: true,
                numberOfDaysInUrban: true,
                totalAmount: true,
                participant: {
                  select: {
                    fullName: true,
                    gender: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        },
        campaign: {
          select: {
            documents: true,
            // campaignParticipants: {
            //   select: {
            //     accountNumber: true,
            //     isVerified: true,
            //     paymentMethod: true,
            //     numberOfDaysInRural: true,
            //     numberOfDaysInUrban: true,
            //     totalAmount: true,
            //     participant: {
            //       select: {
            //         fullName: true,
            //         gender: true,
            //         // phoneNumber: true,
            //       },
            //     },
            //   },
            // },
          },
        },
      },
    }),
    prisma.campaignParticipant.count({
      where: { campaignId },
    }),
  ]);
  const response = {
    totalParticipant: totalParticipants,
    totalPaidAmount: payments?.totalAmount,
    status: payments?.status,
    Documents: payments?.campaign.documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
    })),
    participants: payments?.creditTransactions,
    // participants:
    // campaignParticipants: payments?.campaign.campaignParticipants.map()
  };
  return response || [];
};

export const processPayment = async (campaignId: string, user: AuthUser) => {
  const payment = await prisma.payment.findUnique({
    where: { campaignId },
  });

  if (payment && payment.status !== PaymentType.CREATED) {
    logger.info(
      `Payment for campaign ID ${campaignId} is not in CREATED state`
    );
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment for campaign ID ${campaignId} is not in CREATED state`
    );
  }

  if (!payment) {
    await createCampaignPayment(campaignId, user);
    console.info(`Payment created for campaign ID ${campaignId}`);
  }

  const result = await sendBulkTransfer(campaignId);

  return result;
};

export const handlePaymentWebhook = async (payload: any) => {
  try {
    const data = WebhookPayloadSchema.parse(payload);

    // Check for duplicate webhook (idempotency)
    const existing = await prisma.payment.findFirst({
      where: { bulkId: data.bulkId, jobId: data.jobId },
      include: { creditTransactions: true },
    });

    if (!existing) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
    }

    if (existing.creditTransactions.some((txn) => txn.transactionId)) {
      return "webhook already processed";
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
            transactionId: result.transactionId,
            failureReason: result.message,
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

    return "Webhook processed successfully";
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Webhook validation error:", error.errors);
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid webhook payload");
    }
    console.error("Error processing webhook:", error);
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to process webhook");
  }
};

export const getPaymentStatus = async (campaignId: string) => {
  const result = await prisma.payment.findFirst({
    where: { campaignId },
    select: { progressPercentage: true },
  });

  return result;
};

export default {
  getPaymentsByCampaignId,
  processPayment,
  handlePaymentWebhook,
  getPaymentStatus,
};
