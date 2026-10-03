import { SendCaseSummaryResult } from "@/types/connect";

export interface TwilioDispatchOptions {
  toPhone: string;
  messageText: string;
  channel?: "WHATSAPP" | "SMS";
}

/**
 * Normalizes phone number into international E.164 format (+91 for India if not specified).
 */
export function normalizeE164Phone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Dispatches case summary via Twilio WhatsApp API (with SMS fallback & local sandbox simulation).
 */
export async function sendTwilioMessage(
  options: TwilioDispatchOptions
): Promise<SendCaseSummaryResult> {
  const { toPhone, messageText, channel = "WHATSAPP" } = options;
  const recipient = normalizeE164Phone(toPhone);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";
  const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM;
  const twilioSmsNumber = process.env.TWILIO_PHONE_NUMBER;

  const isConfigured =
    accountSid &&
    authToken &&
    !accountSid.includes("your-") &&
    !authToken.includes("your-") &&
    accountSid.startsWith("AC");

  // If Twilio credentials are not active or in dev sandbox simulation mode
  if (!isConfigured) {
    console.log(
      `[Pankh Connect / Twilio Simulation] Dispatching ${channel} to ${recipient}:\n` +
        `----------------------------------------\n` +
        `${messageText}\n` +
        `----------------------------------------`
    );

    return {
      success: true,
      status: "SIMULATED",
      channel,
      recipientPhone: recipient,
      messageSid: `SM_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sandboxNotice:
        "Demo/Dev Mode: Simulated message dispatch. To receive real WhatsApp messages on this number, configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env and join Twilio Sandbox (+14155238886).",
    };
  }

  // Live Twilio API Dispatch
  try {
    const fromAddress =
      channel === "WHATSAPP"
        ? (twilioWhatsAppFrom
            ? (twilioWhatsAppFrom.startsWith("whatsapp:") ? twilioWhatsAppFrom : `whatsapp:${normalizeE164Phone(twilioWhatsAppFrom)}`)
            : `whatsapp:${normalizeE164Phone(twilioWhatsAppNumber)}`)
        : normalizeE164Phone(twilioSmsNumber || twilioWhatsAppNumber);

    const toAddress =
      channel === "WHATSAPP" ? `whatsapp:${recipient}` : recipient;

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;

    const params = new URLSearchParams();
    params.append("From", fromAddress);
    params.append("To", toAddress);
    params.append("Body", messageText);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const result = await response.json();

    if (!response.ok) {
      console.warn("⚠️ Twilio API rejected dispatch:", result);

      // If WhatsApp failed (e.g. sandbox unjoined error 21608/63016) and channel was WHATSAPP, try SMS fallback
      if (channel === "WHATSAPP" && twilioSmsNumber) {
        console.log("🔄 Twilio WhatsApp failed; attempting SMS fallback...");
        return sendTwilioMessage({
          toPhone: recipient,
          messageText,
          channel: "SMS",
        });
      }

      return {
        success: false,
        status: "FAILED",
        channel,
        recipientPhone: recipient,
        error: result.message || "Twilio dispatch failed",
        sandboxNotice:
          `WhatsApp delivery failed. If using Twilio Sandbox, recipient must send sandbox join code to ${twilioWhatsAppNumber} first.`,
      };
    }

    return {
      success: true,
      status: "SENT",
      channel,
      recipientPhone: recipient,
      messageSid: result.sid,
      sandboxNotice:
        channel === "WHATSAPP"
          ? "Dispatched via Twilio WhatsApp Sandbox."
          : "Dispatched via Twilio SMS.",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error during Twilio dispatch";
    console.error("❌ Twilio dispatch error:", err);
    return {
      success: false,
      status: "FAILED",
      channel,
      recipientPhone: recipient,
      error: errorMsg,
    };
  }
}
