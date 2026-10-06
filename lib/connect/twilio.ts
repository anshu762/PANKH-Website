import { SendCaseSummaryResult } from "@/types/connect";
import {
  normalizeE164Phone,
  cleanPhoneForWhatsApp,
  buildWhatsAppShareUrl,
  dispatchCaseSummary,
} from "./whatsapp";

export { normalizeE164Phone, cleanPhoneForWhatsApp, buildWhatsAppShareUrl };

export interface TwilioDispatchOptions {
  toPhone: string;
  messageText: string;
  channel?: "WHATSAPP" | "SMS";
}

/**
 * Dispatches case summary via direct, zero-cost WhatsApp Click-to-Chat engine.
 * Fully replaces the previous Twilio REST API dependency with immediate, free delivery.
 */
export async function sendTwilioMessage(
  options: TwilioDispatchOptions
): Promise<SendCaseSummaryResult> {
  return dispatchCaseSummary(options);
}
