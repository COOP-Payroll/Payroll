import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    SMS_API_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    REDIS_HOST: Joi.string()
      .default("localhost")
      .description("Redis host for caching"),
    REDIS_PORT: Joi.number()
      .default(6379)
      .description("Redis port for caching"),
    PAYMENT_API_BASE_URL: Joi.string()
      .default("http://localhost:8000")
      .description("Base URL for payment API"),
    PAYMENT_API_KEY: Joi.string()
      .default("your-payment-api-key")
      .description("API key for payment service"),
    POLLING_INTERVAL_MS: Joi.number()
      .default(5000)
      .description("Polling interval in milliseconds for job status checks"),
    MAX_RETRIES: Joi.number()
      .default(3)
      .description("Maximum number of retries for job status checks"),
    WEBHOOK_SECRET: Joi.string()
      .default("your-webhook-secret")
      .description("Secret key for verifying webhook signatures"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  smsAPIURL: envVars.SMS_API_URL,
  redisHost: envVars.REDIS_HOST,
  redisPort: envVars.REDIS_PORT,
  paymentAPIURL: envVars.PAYMENT_API_BASE_URL,
  paymentAPIKey: envVars.PAYMENT_API_KEY,
  pollingIntervalMs: envVars.POLLING_INTERVAL_MS,
  maxRetries: envVars.MAX_RETRIES,
  webhookSecret: envVars.WEBHOOK_SECRET,
};
