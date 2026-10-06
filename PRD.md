# PANKH (ਪੰਖ) — Product Requirements Document (PRD) & Client Operational Guide

> **Document Type:** Product Requirements Document (PRD) & Client Demonstration Handbook  
> **Version:** 2.0 (Production Release)  
> **Target Audience:** Non-Technical Stakeholders, Product Owners, Farm Operators, and Veterinarians  
> **System Status:** Fully Tested & Verified (Zero-Cost WhatsApp Engine Active)  

---

## 📑 Table of Contents
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Platform Ecosystem: Portals & Roles](#2-platform-ecosystem-portals--roles)
3. [Core Feature Catalog (Module by Module)](#3-core-feature-catalog-module-by-module)
   - [Module 1: Public Marketing & Trust Portal](#module-1-public-marketing--trust-portal)
   - [Module 2: Farmer Onboarding & Flock Setup](#module-2-farmer-onboarding--flock-setup)
   - [Module 3: Pankh AI (Multilingual Poultry Assistant)](#module-3-pankh-ai-multilingual-poultry-assistant)
   - [Module 4: Pankh Sentinel (Early Disease Warning Radar)](#module-4-pankh-sentinel-early-disease-warning-radar)
   - [Module 5: Pankh Connect (Direct WhatsApp Vet Escalation)](#module-5-pankh-connect-direct-whatsapp-vet-escalation)
   - [Module 6: Pankh Farm Economics & FCR Ledger](#module-6-pankh-farm-economics--fcr-ledger)
   - [Module 7: Admin Command & Surveillance Center](#module-7-admin-command--surveillance-center)
4. [Step-by-Step "How to Test & Use" Guide (Click-by-Click)](#4-step-by-step-how-to-test--use-guide-click-by-click)
   - [Pre-configured Test Accounts](#pre-configured-test-accounts)
   - [Walkthrough 1: Daily Health Check-in & Weather Monitoring](#walkthrough-1-daily-health-check-in--weather-monitoring)
   - [Walkthrough 2: Voice-Enabled AI Advisory](#walkthrough-2-voice-enabled-ai-advisory)
   - [Walkthrough 3: 1-Click WhatsApp Vet Teleconsultation](#walkthrough-3-1-click-whatsapp-vet-teleconsultation)
   - [Walkthrough 4: Batch Economics, Expenses & FCR Calculation](#walkthrough-4-batch-economics-expenses--fcr-calculation)
   - [Walkthrough 5: Admin Alert Surveillance & Thresholds Control](#walkthrough-5-admin-alert-surveillance--thresholds-control)
5. [Clinical Safety Rules & Ethical Guardrails](#5-clinical-safety-rules--ethical-guardrails)
6. [Why the Zero-Cost Architecture Matters for Business](#6-why-the-zero-cost-architecture-matters-for-business)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. Executive Summary & Product Vision

### What is PANKH?
**PANKH (ਪੰਖ)** is a Punjab-first poultry farm operating platform designed to prevent catastrophic flock disease mortality, protect farmer profit margins, and bridge the critical gap between rural poultry sheds and verified veterinarians.

### The Real-World Problem
In Punjab and North India, poultry farmers (broiler and layer) manage thousands of birds. However:
1. **Sudden Disease Outbreaks**: Devastating viral infections like Newcastle Disease (Ranikhet) or Gumboro (IBD) can wipe out an entire flock (2,000–5,000 birds) in 48 hours if sub-clinical signs (water drop, feed reduction) are missed.
2. **Informal & Misleading Advice**: Farmers often panic and purchase unverified, expensive antibiotics from informal medicine shops, worsening mortality and causing antimicrobial resistance.
3. **Language & Usability Barrier**: Most farm software is built in complex technical English designed for desktop computers. Rural farmers need a mobile-first, voice-enabled assistant in their mother tongue (**Punjabi** and **Hindi/Hinglish**).
4. **Opaque Financial Tracking**: Farmers rarely know their actual **FCR (Feed Conversion Ratio)** or **Cost per Bird** until harvest, leading to unpredictable losses when market wholesale prices fluctuate.

### The Solution
PANKH provides a unified, mobile-ready digital shield that combines:
* **Early Warning Surveillance (Sentinel)**: Detects disease risks 3 days before visible mortality.
* **Vetted AI Guidance (Pankh AI)**: Multilingual voice-enabled advisor backed by verified veterinary research (GADVASU & ICAR).
* **Direct Doctor Escalation (Connect)**: Instant 1-click clinical handover to verified Punjab veterinarians via WhatsApp with zero third-party platform fees.
* **Flock Financial Ledger (Farm Economics)**: Live tracking of batch costs, FCR benchmarks, and harvest profitability.

---

## 2. Platform Ecosystem: Portals & Roles

PANKH is **not just a simple dashboard**; it is an integrated multi-tier platform serving three primary user roles:

```
                               ┌───────────────────────────────────────────────┐
                               │           PANKH PLATFORM ECOSYSTEM            │
                               └──────────────────────┬────────────────────────┘
                                                      │
         ┌─────────────────────────┬──────────────────┴──────────────────┬─────────────────────────┐
         ▼                         ▼                                     ▼                         ▼
┌─────────────────┐       ┌─────────────────┐                   ┌─────────────────┐       ┌─────────────────┐
│ PUBLIC PORTAL   │       │ FARMER PORTAL   │                   │  ADMIN PORTAL   │       │  BACKEND ENGINES│
│ • Home & Story  │       │ • 6 Dashboards  │                   │ • 9 Control Hubs│       │ • AI RAG & Vision│
│ • Punjab Stats  │       │ • Onboarding    │                   │ • Surveillance  │       │ • Voice STT/TTS │
│ • Auth & Login  │       │ • Profile & Lang│                   │ • Vet Registry  │       │ • WhatsApp Link │
└─────────────────┘       └─────────────────┘                   └─────────────────┘       └─────────────────┘
```

### Role Matrix

| Role | Accessible Areas | Primary Objective |
| :--- | :--- | :--- |
| **Public / Visitor** | Public Landing Page (`/`), Authentication (`/login`, `/register`) | Understand platform benefits, register as a farmer, or log in. |
| **Farmer (ਕਿਸਾਨ)** | Complete Farmer Portal (`/dashboard/*`), Farm Onboarding Wizard (`/onboarding/farm`), Profile (`/dashboard/profile`) | Monitor flock health, perform 60-second morning check-ins, consult AI, escalate to vets, and manage batch expenses. |
| **Admin & Clinical Staff** | Central Command Center (`/admin/*`) with 9 dedicated monitoring dashboards | Monitor Punjab-wide disease outbreaks, manage vet directories, audit AI answers, and adjust risk thresholds. |

---

## 3. Core Feature Catalog (Module by Module)

### Module 1: Public Marketing & Trust Portal
* **URL:** `/`
* **What it does:** Provides a modern, culturally grounded public introduction to PANKH in both Punjabi and English.
* **Key Capabilities:**
  - **Live Impact Metrics**: Highlighting mortality reduction targets, active poultry sheds, and network response times.
  - **Pillar Showcase**: Interactive visual cards explaining Pankh AI, Sentinel, Connect, and Farm Economics.
  - **Punjab Poultry Focus**: Context-specific messaging highlighting local challenges (summer heat-stress, Ludhiana mandi pricing, regional disease history).
  - **Interactive Call-to-Action**: Direct links to registration and one-click login for demonstration purposes.

---

### Module 2: Farmer Onboarding & Flock Setup
* **URL:** `/onboarding/farm`
* **What it does:** A gentle, guided 3-step wizard that helps newly registered farmers set up their digital poultry shed without complex technical jargon.
* **Key Capabilities:**
  - **Farm Location**: Selection of Punjab districts (Ludhiana, Sangrur, Patiala, Jalandhar, Bathinda, etc.).
  - **Infrastructure Configuration**: Shed type (Semi-EC, Open-sided), ventilation type (Tunnel, Natural), and total bird capacity.
  - **Active Batch Initialization**: Breed selection (Cobb 500, Ross 308, Hubbards), initial day-old chick (DOC) count, and placement date.

---

### Module 3: Pankh AI (Multilingual Poultry Assistant)
* **URL:** `/dashboard/ask`
* **What it does:** A 24/7 poultry health advisory tool that farmers can interact with using text or voice in **Punjabi**, **Hindi**, or **English**.
* **Key Capabilities:**
  - **Punjabi Voice Input (STT)**: Farmers can click the microphone button, speak naturally in Punjabi, verify the real-time transcription, and submit.
  - **Audio Read-Out (TTS)**: AI answers can be read aloud in natural Punjabi for farmers with limited literacy.
  - **Strict 6-Step Clinical Structure**: Every health answer follows a mandatory clinical structure:
    $$\text{Direct Answer} \rightarrow \text{Why it Happened} \rightarrow \text{Immediate Action} \rightarrow \text{Follow-up Question} \rightarrow \text{Doctor Escalation} \rightarrow \text{Source Citation}$$
  - **Photo Diagnostic Analysis**: Ability to upload flock photos or droppings images for symptom analysis.
  - **Source-Grounded (RAG)**: Answers are strictly derived from verified veterinary research (ICAR, GADVASU Ludhiana, CPDO).

---

### Module 4: Pankh Sentinel (Early Disease Warning Radar)
* **URLs:** `/dashboard/sentinel` & `/dashboard/sentinel/checkin`
* **What it does:** The farm’s early warning defense system. By tracking four simple daily numbers, it spots disease patterns **3 to 5 days before birds start dying**.
* **Key Capabilities:**
  - **60-Second Daily Check-in Form**: High-contrast, easy-to-use form to enter:
    1. Daily bird mortality (count)
    2. Feed consumed (bags or kg)
    3. Water intake (litres)
    4. Indoor shed temperature (°C)
    5. Symptom tags (e.g., watery droppings, coughing, huddling)
  - **Offline-Resilient Draft Saving**: If internet connectivity drops while in the poultry shed, the form automatically saves locally and syncs once connection is restored.
  - **Rolling 7-Day Baseline**: Compares today's numbers against the moving average. If water intake drops by >15% or feed drops by >10%, it immediately flags an alert.
  - **Weather & Heat-Stress Index (THI)**: Live weather integration that calculates the poultry Temperature-Humidity Index and alerts farmers when evaporative cooling or electrolytes are needed.
  - **Triage Classification**: Classifies shed risk into **Normal (Green)**, **Watch (Amber)**, or **Urgent (Red)**.

---

### Module 5: Pankh Connect (Direct WhatsApp Vet Escalation)
* **URLs:** `/dashboard/connect` & `/dashboard/connect/[caseId]`
* **What it does:** Connects farmers directly to certified Punjab veterinarians and diagnostic laboratories (such as GADVASU Ludhiana and NRDDL) with zero friction.
* **Key Capabilities:**
  - **Geospatial Proximity Sorting**: Automatically ranks veterinarians and labs based on real driving distance (km) from the farmer’s village.
  - **Clinical Case Summary Generator**: Automatically synthesizes the flock's last 7 days of mortality, water/feed drops, and current age into an organized clinical brief.
  - **Informed Consent Gate**: The farmer explicitly reviews and authorizes what data will be shared before reaching out to the doctor.
  - **Zero-Cost 1-Click WhatsApp Escalation**: Uses direct WhatsApp technology (`wa.me`) to open WhatsApp on the farmer’s mobile or computer with the clinical summary pre-typed.
  - **Case Tracking Lifecycle**: Tracks consultation status from Created $\rightarrow$ Contacted $\rightarrow$ Appointment $\rightarrow$ Resolved.

---

### Module 6: Pankh Farm Economics & FCR Ledger
* **URLs:** `/dashboard/economics` & `/dashboard/economics/add`
* **What it does:** Replaces messy paper notebooks with a clean, real-time financial ledger designed specifically for broiler cycles.
* **Key Capabilities:**
  - **Real-Time FCR (Feed Conversion Ratio)**: Calculates the exact efficiency metric:
    $$\text{FCR} = \frac{\text{Total Feed Consumed (kg)}}{\text{Total Live Weight Gained (kg)}}$$
  - **Cost per Surviving Bird**: Accurately accounts for mortality so farmers know the true cost per bird ready for market.
  - **Expense Categorization**: Fast logging of Day-Old Chicks (DOC), Feed, Medicines/Vaccines, Bedding (Sawdust/Rice Husk), Labor, and Electricity.
  - **Harvest & P&L Analysis**: Automatically computes Gross Profit and Margin percentage when birds are sold at local mandi rates.

---

### Module 7: Admin Command & Surveillance Center
* **URLs:** `/admin` and sub-routes (9 Dedicated Dashboards)
* **What it does:** A comprehensive administrative console for health officials, lead veterinarians, and platform administrators.
* **Dashboards Included:**
  1. **Command Center (`/admin`)**: Bird population trends, active farm counts, and platform-wide health status.
  2. **Sentinel Risk Rules (`/admin/rules`)**: Allows administrators to adjust alert thresholds (e.g., change mortality trigger from 1.5% to 2.0%) without touching code.
  3. **Disease Alerts Monitor (`/admin/alerts`)**: Real-time map and list of all farms currently in Red or Amber status across Punjab.
  4. **Vet & Lab Directory (`/admin/vetlab`)**: Manage doctor credentials, verification badges, phone numbers, and operational hours.
  5. **Farmer Directory (`/admin/farmers`)**: View registered poultry farms, shed capacities, and active batch histories.
  6. **Knowledge Base Manager (`/admin/knowledge`)**: Manage medical literature and feeding guidelines used by the AI assistant.
  7. **AI Answers Clinical Audit (`/admin/ai-review`)**: Review AI responses to ensure compliance with medical safety rules.
  8. **Platform Analytics (`/admin/analytics`)**: Detailed telemetry on voice queries, check-in completion, and feature usage.
  9. **Regional Economics Benchmarks (`/admin/economics-analytics`)**: State-level broiler economics, mandi price averages, and district FCR benchmarks.

---

## 4. Step-by-Step "How to Test & Use" Guide (Click-by-Click)

This section provides a non-technical walkthrough for clients and evaluators to test every major capability within 10 minutes.

### Pre-configured Test Accounts

| Account Role | Email Address | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Farmer (Demo)** | `farmer@pankh.app` | `PankhAdmin2026!` | Test the complete farmer experience with pre-loaded flock data in Ludhiana. |
| **Super Admin** | `admin@pankh.app` | `PankhAdmin2026!` | Test surveillance, rule management, and clinical audit dashboards. |

---

### Walkthrough 1: Daily Health Check-in & Weather Monitoring
* **Goal**: See how a farmer logs daily shed data in under 60 seconds.
1. Open your browser and navigate to: `http://localhost:3000/login`
2. Log in using `farmer@pankh.app` and `PankhAdmin2026!`.
3. You will land on the **Farm Overview Dashboard** (`/dashboard`). Observe the active flock details (Cobb 500, Day 21) and the live weather widget for Ludhiana.
4. Click on **Sentinel** in the left navigation, then click **Daily Check-in** (or go to `/dashboard/sentinel/checkin`).
5. Enter sample data:
   * **Daily Mortality**: `4`
   * **Feed Consumed**: `240` kg
   * **Water Intake**: `680` litres
   * **Shed Temperature**: `31` °C
   * **Symptoms**: Check *“Watery Droppings”* and *“Mild Coughing”*.
6. Click **Submit Daily Check-in**.
7. The system evaluates the data instantly against the 7-day average and updates the health status indicator.

---

### Walkthrough 2: Voice-Enabled AI Advisory
* **Goal**: Ask a poultry question in Punjabi or Hindi and observe the 6-step medical guardrails.
1. In the left navigation, click **Pankh AI** (or go to `/dashboard/ask`).
2. Type or paste this sample question:
   > *"ਮੇਰੇ ਚੂਚਿਆਂ ਨੂੰ ਪਤਲੀ ਵਿੱਠ ਆ ਰਹੀ ਹੈ ਅਤੇ ਪਾਣੀ ਘੱਟ ਪੀ ਰਹੇ ਹਨ, ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?"*  
   *(Or in Hindi/English: "My birds have watery droppings and are drinking less water. What should I do?")*
3. Press **Enter** or click **Send**.
4. Observe the response:
   * Notice that the AI **never claims to be a doctor or makes an absolute diagnosis**.
   * Notice the clear 6-step structure: Answer $\rightarrow$ Why $\rightarrow$ Action $\rightarrow$ Ask $\rightarrow$ Escalate $\rightarrow$ Source.
   * Click the **Listen (Audio)** button to hear the answer read aloud in natural Punjabi.

---

### Walkthrough 3: 1-Click WhatsApp Vet Teleconsultation
* **Goal**: Generate an automated clinical summary and launch WhatsApp with zero friction.
1. In the left navigation, click **Pankh Connect** (or go to `/dashboard/connect`).
2. You will see a directory of verified Punjab doctors and labs (e.g., *Dr. Harpreet Singh Gill, MVSc*).
3. On Dr. Harpreet Singh's card, click the green button: **"Share Case Summary"**.
4. The **Clinical Consent Modal** will appear:
   * Review the pre-compiled clinical brief (Flock age, water intake, mortality, reported symptoms).
   * Notice the transparency notice explaining data privacy.
5. Click **"Open WhatsApp Web / App"**.
6. A new tab will launch `wa.me` directly with the complete bilingual clinical report pre-filled in your WhatsApp message box, ready to send to the veterinarian with a single tap.

---

### Walkthrough 4: Batch Economics, Expenses & FCR Calculation
* **Goal**: Track a farm expense and see real-time FCR and profitability metrics.
1. In the left navigation, click **Farm Economics** (or go to `/dashboard/economics`).
2. Observe the current batch metrics: Total Investment, Feed Cost Share (typically 65-70%), and current FCR benchmark.
3. Click **Add Expense / Entry** (or go to `/dashboard/economics/add`).
4. Enter sample expense details:
   * **Category**: *Feed*
   * **Amount (₹)**: `12500`
   * **Quantity**: `5 Bags (Pre-Starter)`
   * **Notes**: *Delivered from Khanna Feed Mill*
5. Click **Save Entry**.
6. The batch ledger updates instantly, recalculating the total production cost and live cost per bird.

---

### Walkthrough 5: Admin Alert Surveillance & Thresholds Control
* **Goal**: Experience the regional surveillance console.
1. Click **Log Out** in the bottom left, then log in using:
   * **Email**: `admin@pankh.app`
   * **Password**: `PankhAdmin2026!`
2. You will land on the **Admin Command Center** (`/admin`).
3. Click **Alert Rules** (`/admin/rules`) in the left navigation.
   * Here you can view and edit trigger thresholds (e.g., Mortality Warning Rate %, Water Drop Urgent %).
4. Click **Live Alerts** (`/admin/alerts`).
   * Observe active alerts flagged across Punjab districts (Red, Amber, Green).
5. Click **AI Review** (`/admin/ai-review`).
   * Inspect recent AI responses to verify that all advice adhered to clinical safety guidelines.

---

## 5. Clinical Safety Rules & Ethical Guardrails

PANKH was built under strict veterinary ethics. The platform enforces five non-negotiable rules:

1. **No Autonomous Diagnoses**: The AI assistant never provides definitive disease declarations (e.g., *"Your flock definitely has Ranikhet"*). It classifies risk (Normal/Watch/Urgent) and instructs the farmer to consult a veterinarian.
2. **Approved Knowledge Sources Only**: The AI does not generate advice from raw unvetted internet data. It retrieves knowledge exclusively from accredited institutional sources (GADVASU Ludhiana, ICAR, Central Poultry Development Organization).
3. **Deterministic Red-Flag Overrides**: If mortality surges above the critical threshold or acute respiratory distress is reported, the system immediately bypasses general advice and displays an urgent clinical escalation card.
4. **Transparent Assumptions**: Financial projections never present estimates as absolute facts. Missing data is always marked as *"estimated at ₹X/bird"*.
5. **Farmer Data Sovereignty**: Flock health summaries are shared with external doctors only when the farmer explicitly clicks the confirmation button.

---

## 6. Why the Zero-Cost Architecture Matters for Business

Many agritech platforms fail because they incur heavy recurring costs for SMS gateways and enterprise WhatsApp Business APIs (Twilio, Meta WABA) that charge ₹0.50 to ₹2.00 per message.

### How PANKH Solves This:
* **Direct Deep-Link Engine (`wa.me`)**: PANKH generates optimized, pre-encoded clinical messages that utilize WhatsApp's official native deep-linking protocol.
* **₹0 Monthly Third-Party Bills**: The farm or organization does not need expensive Twilio subscriptions, credit card top-ups, or complicated Meta WABA approvals.
* **100% Reliable Delivery**: Because messages originate directly from the farmer's personal or farm WhatsApp account to the veterinarian's direct number, messages never land in spam or fail due to carrier DND (Do Not Disturb) filters.

---

## 7. Frequently Asked Questions (FAQ)

### Q1: Can a farmer use PANKH on a low-end Android smartphone?
**Yes.** PANKH is built as a mobile-first Progressive Web App (PWA). It uses lightweight interfaces, fast caching, and low-bandwidth assets, ensuring responsive performance even on budget Android devices.

### Q2: What happens if internet connectivity is lost in the shed?
PANKH features local state draft persistence. If a farmer fills out the 60-Second Check-in or an Expense entry while offline, the form retains all inputs. Once the device reconnects to mobile data or Wi-Fi, the submission completes seamlessly without data loss.

### Q3: Does the veterinarian need to install special software?
**No.** Veterinarians receive structured, bilingual clinical summaries directly on their standard WhatsApp. They can read the bird age, water drop %, and symptoms, and reply or call the farmer back immediately.

### Q4: Can PANKH support other languages in the future?
**Yes.** PANKH’s translation and prompt architecture currently supports **Punjabi**, **Hindi/Hinglish**, and **English**. It is architected to easily expand to Marathi, Telugu, Bengali, and other regional languages by extending the language dictionaries.

---

*© 2026 PANKH Platform. Built for the Poultry Farmers of Punjab.*
