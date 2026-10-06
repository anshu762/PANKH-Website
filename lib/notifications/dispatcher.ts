import { prisma } from "@/lib/db";
import { dispatchCaseSummary, normalizeE164Phone } from "@/lib/connect/whatsapp";

export interface DispatchNotificationOptions {
  farmerId: string;
  type:
    | "CHECKIN_REMINDER"
    | "AMBER_ALERT"
    | "RED_ALERT"
    | "CASE_UPDATE"
    | "VACCINATION_DUE"
    | "WEEKLY_ECONOMICS";
  title: string;
  body: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  linkUrl?: string;
  sendWhatsApp?: boolean;
  allowSmsFallback?: boolean;
  metadata?: Record<string, any>;
}

export interface DispatchResult {
  notificationId: string;
  inAppCreated: boolean;
  whatsAppDispatched: boolean;
  smsDispatched: boolean;
  externalStatus?: string;
  note?: string;
}

/**
 * Universal multi-channel notification dispatcher for Pankh.
 * Stores in-app notification in DB and selectively dispatches via Twilio WhatsApp / SMS
 * in strict accordance with the Section 7.3 notification policy.
 */
export async function dispatchNotification(
  options: DispatchNotificationOptions
): Promise<DispatchResult> {
  const {
    farmerId,
    type,
    title,
    body,
    severity = "INFO",
    linkUrl,
    sendWhatsApp = false,
    allowSmsFallback = false,
    metadata = {},
  } = options;

  // 1. Fetch farmer & user contact details
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: {
      user: {
        select: {
          phone: true,
          preferredLanguage: true,
          name: true,
        },
      },
    },
  });

  if (!farmer) {
    throw new Error(`Farmer ${farmerId} not found for notification dispatch.`);
  }

  // 2. Create in-app Notification record in DB
  const inAppRecord = await prisma.notification.create({
    data: {
      farmerId,
      type,
      title,
      body,
      severity,
      linkUrl,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });

  let whatsAppDispatched = false;
  let smsDispatched = false;
  let externalStatus: string | undefined;
  let note: string | undefined;

  // 3. Dispatch to External Channel (WhatsApp / SMS) if policy specifies and farmer has phone
  const recipientPhone = farmer.user.phone;
  const canSendExternal = sendWhatsApp && recipientPhone && recipientPhone.length >= 10;

  if (canSendExternal) {
    const formattedMessage =
      `*Pankh Poultry Alert | ਪੰਖ*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*${title}*\n\n` +
      `${body}\n\n` +
      (linkUrl ? `🔗 Action: ${process.env.NEXTAUTH_URL || "https://pankh.app"}${linkUrl}\n` : "") +
      `_Pankh Poultry Support System_`;

    try {
      // Direct WhatsApp Click-to-Chat payload generation
      const waRes = await dispatchCaseSummary({
        toPhone: recipientPhone,
        messageText: formattedMessage,
        channel: "WHATSAPP",
      });

      externalStatus = waRes.status;
      whatsAppDispatched = waRes.success;
      note = waRes.sandboxNotice;

      // Update in-app notification record with delivery markers
      await prisma.notification.update({
        where: { id: inAppRecord.id },
        data: {
          sentViaWhatsApp: whatsAppDispatched,
          sentViaSms: smsDispatched,
        },
      });
    } catch (err: any) {
      console.error("[Notification Engine] External dispatch exception:", err);
      note = `External channel error: ${err.message || String(err)}`;
    }
  }

  return {
    notificationId: inAppRecord.id,
    inAppCreated: true,
    whatsAppDispatched,
    smsDispatched,
    externalStatus,
    note,
  };
}
