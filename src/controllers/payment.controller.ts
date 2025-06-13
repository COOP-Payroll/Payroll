import catchAsync from "../utils/catch-async";
import paymentService from "../services/payment.service";

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

  const paymentResult = await paymentService.processPayment(campaignId);
});

export default {
  getPaymentsByCampaignId,
  processPayment,
};
