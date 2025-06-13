import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/api-error";

export const getPaymentsByCampaignId = async (campaignId: string) => {
  const payments = await prisma.payment.findUnique({
    where: { campaignId },
    select: {
      creditTransactions: {
        select: {
          amount: true,
          creditAccount: true,
          status: true,
          campaignParticipant: {
            select: {
              accountNumber: true,
              isVerified: true,
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
    },
  });

  return payments || [];
};

export const processPayment = async (campaignId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { campaignId },
  });

  if (!payment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payment for campaign ID ${campaignId} not found`
    );
  }

  return payment;
};

export default {
  getPaymentsByCampaignId,
  processPayment,
};
