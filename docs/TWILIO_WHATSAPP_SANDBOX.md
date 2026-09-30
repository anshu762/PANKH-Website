# Twilio WhatsApp Sandbox Integration Guide — Pankh Connect

## Overview
Pankh Connect allows poultry farmers to escalate disease risk signals directly to licensed veterinarians and regional diagnostic laboratories (such as GADVASU Poultry Poly-Clinic and NRDDL Ludhiana) via WhatsApp and SMS.

During development and testing, WhatsApp messaging operates through the **Twilio WhatsApp Sandbox**.

---

## 1. Local Development / Automated Test Mode (No Setup Required)
When `TWILIO_ACCOUNT_SID` or `TWILIO_AUTH_TOKEN` is unset or contains placeholder values (e.g. `your-twilio-...`), Pankh automatically operates in **Dev Simulation Mode**:
- Dispatches are cleanly simulated without throwing errors or blocking test scripts.
- The formatted case summary with the mandatory non-diagnosis disclaimer is logged to the console.
- Case records successfully transition from `CREATED` → `CONTACTED`.
- Audit logs are written with `dispatchStatus: "SIMULATED"` and synthetic message SIDs (`SM_SIM_...`).

---

## 2. Testing with Real WhatsApp Delivery on Your Phone

If you wish to receive actual WhatsApp messages on your physical phone:

### Step 1: Twilio Sandbox Setup
1. Create a free account at [twilio.com](https://www.twilio.com).
2. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**.
3. You will see a phone number (usually `+1 415 523 8886`) and a unique sandbox join keyword (e.g., `join proper-monkey`).

### Step 2: Join the Sandbox from Your Phone
1. Open WhatsApp on your phone.
2. Send the exact message `join <your-keyword>` to `+1 415 523 8886`.
3. Twilio will reply: *"You are all set! The sandbox is now active for this number."*

### Step 3: Configure Environment Variables
Add the following to your `.env`:
```env
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="+14155238886"
TWILIO_PHONE_NUMBER="+1XXXXXXXXXX"
```

### Step 4: Dispatch Case
In Pankh Connect:
1. Go to `/dashboard/connect` or an active case `/dashboard/connect/[caseId]`.
2. Click **Share Case Summary** on a specialist card.
3. Review the **Section 11 Data Sharing Consent Modal**.
4. Click **Authorize & Dispatch via WhatsApp**.
5. The message will arrive immediately on your connected WhatsApp number.

---

## 3. Mandatory Clinical Compliance (Hard Rule #1)
Every WhatsApp case summary dispatched by Pankh Connect concludes with the mandatory disclaimer:
> `⚠️ DISCLAIMER: AI-prepared case summary; not a confirmed veterinary diagnosis. Provided to assist licensed veterinarians and diagnostic laboratories.`
