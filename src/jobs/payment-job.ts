import { TransactionStatus } from "@prisma/client";
import { PaymentJobData } from "../types/payment";
import prisma from "../client";
import logger from "../config/logger";

export async function processPaymentJob(data: PaymentJobData): Promise<void> {
  try {
    const participant = await prisma.campaignParticipant.findUnique({
      where: { id: data.participantId },
    });

    if (!participant) {
      throw new Error(`Participant with ID ${data.participantId} not found`);
    }

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          debitAccount: data.debitAccount,
          totalAmount: data.totalAmount,
          bulkId: data.bulkId,
          participantId: data.participantId,
        },
      });

      await tx.creditTransaction.createMany({
        data: data.creditTransactions.map((tx) => ({
          orderId: tx.orderId,
          creditAccount: tx.creditAccount,
          amount: tx.amount,
          status: TransactionStatus.PENDING,
          paymentId: payment.id,
        })),
      });
    });

    logger.info(`Payment created successfully for bulkId: ${data.bulkId}`);
  } catch (error) {
    logger.error("Error processing payment job", {
      error,
      bulkId: data.bulkId,
    });
    throw error;
  }
}
