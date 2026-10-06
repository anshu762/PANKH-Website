import { SendCaseSummaryResult } from "@/types/connect";

export interface WhatsAppDispatchOptions {
  toPhone: string;
  messageText: string;
  channel?: "WHATSAPP" | "SMS";
}

/**
 * Normalizes phone number into international E.164 format (+91 for India if not specified).
 */
export function normalizeE164Phone(phone: string): string {
  if (!phone) return "";
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
 * Extracts digits-only phone number with international country code for wa.me links.
 * E.g., "+91 95725-93673" or "9572593673" -> "919572593673"
 */
export function cleanPhoneForWhatsApp(phone?: string | null): string {
  if (!phone) return "";
  const normalized = normalizeE164Phone(phone);
  return normalized.replace(/[^0-9]/g, "");
}

/**
 * Builds a direct, zero-cost WhatsApp Click-to-Chat deep link (wa.me) with pre-filled message text.
 * Works seamlessly on Android, iOS, WhatsApp Web, and Desktop apps without any Meta API verification.
 */
export function buildWhatsAppShareUrl(
  phone: string | null | undefined,
  messageText: string
): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(messageText);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Generates direct WhatsApp share payload and updates case readiness.
 * Zero external API dependency, zero cost, instant delivery.
 */
export async function dispatchCaseSummary(
  options: WhatsAppDispatchOptions
): Promise<SendCaseSummaryResult> {
  const { toPhone, messageText, channel = "WHATSAPP" } = options;
  const recipient = normalizeE164Phone(toPhone);
  const whatsappUrl = buildWhatsAppShareUrl(toPhone, messageText);

  return {
    success: true,
    status: "READY",
    channel,
    recipientPhone: recipient,
    whatsappUrl,
    summaryText: messageText,
    sandboxNotice: "Direct WhatsApp Click-to-Chat ready.",
  };
}
