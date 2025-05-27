import { SmsError } from "../types/express";

async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  try {
    // Simulate SMS sending (replace with actual SMS provider logic)
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    // Example: await twilio.messages.create({ to: phoneNumber, from: 'YOUR_TWILIO_NUMBER', body: message });
  } catch (error: any) {
    const smsError: SmsError = new Error(
      `Failed to send SMS: ${error.message}`
    );
    smsError.code = error.code || "SMS_PROVIDER_ERROR";
    throw smsError;
  }
}

export { sendSMS };
