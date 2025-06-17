import axios, { AxiosInstance } from "axios";
import config from "../config/config";

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.paymentAPIURL,
  headers: {
    // Authorization: `Bearer ${process.env.THIRD_PARTY_API_KEY}`,
    "Content-Type": "application/json",
    "X-API-Key": config.paymentAPIKey,
  },
});
