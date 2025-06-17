import { createHmac } from "crypto";
import config from "../config/config";

export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  const hmac = createHmac("sha256", config.webhookSecret);
  const computedSignature = hmac.update(payload).digest("hex");
  return computedSignature === signature;
};
