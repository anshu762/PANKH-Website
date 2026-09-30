# Pankh Multi-Channel Notifications Guide (Section 7.3)

This document explains the live notification channels implemented in **Pankh** for early disease surveillance, check-in reminders, veterinary escalations, vaccination alerts, and farm economics.

---

## 1. Summary of Notification Triggers

| Trigger | Channels | Threshold / Rule | Farmer Action |
| :--- | :--- | :--- | :--- |
| **Daily Check-in Pending** | In-app Banner + Bell + WhatsApp | Sent after 2:00 PM if no daily check-in logged today. Max 1 per day. | Deep-links to 60s Check-in form. |
| **AMBER Alert** | In-app Bell Only | Sentinel composite risk score $\ge 35$ or moderate feed/water drop. | Reviews baseline deviation radar. |
| **RED Alert** | In-app Bell + WhatsApp (with SMS fallback) | Sudden mortality spike $\ge 1.0\%$ or hard red-flag symptoms. | Immediate 1-tap "Connect with Vet" dispatch. |
| **Vet Case Status Update** | In-app Bell + WhatsApp | Clinical status change: `CONTACTED` $\to$ `APPOINTMENT` $\to$ `ADVICE` $\to$ `RESOLVED`. | Views clinical prescription / advice. |
| **Vaccination Due** | In-app Bell + WhatsApp | Flock age matches approved `VaccinationSchedule` (e.g. Day 14 IBD). | Administers vaccine per recommended route. |
| **Weekly Economics** | In-app Bell Only | Weekly summary of top flock margin / feed cost insight. | Opens flock ledger & cost/bird analysis. |

---

## 2. Live Channels vs. Production Requirements

### A. WhatsApp via Twilio Sandbox (Currently Live)
- **Status**: Live in code (`lib/notifications/dispatcher.ts` and `lib/connect/twilio.ts`).
- **Endpoint**: Twilio Programmable Messaging API (`https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json`).
- **Sender**: `whatsapp:+14155238886` (Standard Twilio WhatsApp Sandbox).
- **Recipient Requirement**: In development and demo mode, recipient phone numbers must join your Twilio Sandbox:
  1. Open WhatsApp on the recipient phone.
  2. Send `join <your-sandbox-keyword>` to `+1 415 523 8886`.
  3. Once joined, WhatsApp alerts are delivered instantly with bold formatting and deep links.
- **Resilient Fallback**: If Twilio credentials are not supplied or recipient is unjoined, the engine logs the simulated payload to server console without breaking user requests.

### B. Transactional SMS Fallback
- **Status**: Live in code as secondary fallback.
- **Rule**: If a `RED` alert WhatsApp message fails (e.g. farmer is not on WhatsApp or phone lacks mobile data), Twilio automatically attempts SMS dispatch via `TWILIO_PHONE_NUMBER`.
- **Production Requirement for India**: Deployment to Indian mobile numbers requires **DLT (Distributed Ledger Technology)** registration with Telecom Regulatory Authority of India (TRAI) and pre-approved Principal Entity (PE) headers and templates.

### C. In-App Notification Bell & Dashboard Banner
- **Status**: 100% Live, fully database-backed (`Notification` model in Prisma).
- **Features**: Real-time polling, unread count badge, severity-colored icons, mark-as-read, and mark-all-read.

### D. Production Web Push (PWA Service Worker)
- **Status**: PWA Shell & Service Worker (`public/sw.js` and `app/manifest.ts`) are live for caching and installability.
- **Production Roadmap**: Full background Web Push notifications require VAPID key configuration (`web-push` library) and PushManager subscription storage to trigger lock-screen alerts when the browser is completely closed.

---

## 3. Environment Variables for Notifications

```env
# Twilio Account SID (starts with AC)
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Twilio Auth Token
TWILIO_AUTH_TOKEN="your_twilio_auth_token_here"

# Twilio WhatsApp number in E.164 format
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Optional Twilio SMS sender phone number
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"
```
