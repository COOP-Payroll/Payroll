import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import roleService from "../services/role.service";
import { AuthUser } from "../types/express";

const createPayment = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  const campaignTransactionCreated =
    campaignTransactionService.createPayment(campaignId);

  res.send(httpStatus.CREATED).json({
    data: campaignTransactionCreated,
    message: "Campaign paid successfully!",
  });
});

export default { createPayment };
