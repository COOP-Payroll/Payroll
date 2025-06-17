import catchAsync from "../utils/catch-async";
import paymentService from "../services/payment.service";
import { verifyWebhookSignature } from "../utils/verify-webhook-signature";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";

const getPaymentsByCampaignId = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  const fetchpayments = await paymentService.getPaymentsByCampaignId(
    campaignId
  );
  res.status(200).send({
    data: fetchpayments,
    message: "Campaign Payments retrieved successfully",
  });
});

const processPayment = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const user = req.user as AuthUser;

  const paymentResult = await paymentService.processPayment(campaignId, user);

  res.status(200).send({
    data: paymentResult,
    message: "Payment processed successfully",
  });
});

const paymentWebhook = catchAsync(async (req, res) => {
  const payload = req.body;
  const signature = req.headers["x-webhook-signature"] as string;

  // if (!signature || !verifyWebhookSignature(payload, signature)) {
  //   throw new ApiError(400, "Invalid webhook signature");
  // }

  const paymentResult = await paymentService.handlePaymentWebhook(payload);

  res.status(200).send({
    data: [],
    message: paymentResult,
  });
});

const paymentStatus = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  const result = await paymentService.getPaymentStatus(campaignId);
  res.status(200).send({
    data: result,
    message: "Payment Status retrieved successfully",
  });
});

export default {
  getPaymentsByCampaignId,
  processPayment,
  paymentWebhook,
  paymentStatus,
};
