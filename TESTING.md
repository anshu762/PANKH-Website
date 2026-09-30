# 🧪 PANKH — End-to-End Testing & Verification Guide
> **Pankh (ਪੰਖ / पंख)**: Punjabi-First Poultry Farm Intelligence Platform  
> Designed for **Both Non-Technical Evaluators** (Farmers, Vets, Investors, Product Managers) and **Technical Engineers**.

---

## 📌 Table of Contents
1. [Test Credentials & Quick Access](#1-test-credentials--quick-access)
2. [External Services & Architecture Map](#2-external-services--architecture-map)
3. [Step-by-Step Testing Guide: Phase 1 to Phase 9](#3-step-by-step-testing-guide-phase-1-to-phase-9)
   - [Phase 1: Authentication & Role-Based Access](#phase-1-authentication--role-based-access)
   - [Phase 2: Farmer Onboarding & Shed Setup](#phase-2-farmer-onboarding--shed-setup)
   - [Phase 3: Pankh AI Voice & Health Assistant](#phase-3-pankh-ai-voice--health-assistant)
   - [Phase 4: Pankh Sentinel Early Disease Surveillance](#phase-4-pankh-sentinel-early-disease-surveillance)
   - [Phase 5: Pankh Connect Vet Teleconsultation & Escalation](#phase-5-pankh-connect-vet-teleconsultation--escalation)
   - [Phase 6: Pankh Farm Economics & Margin Engine](#phase-6-pankh-farm-economics--margin-engine)
   - [Phase 7: Super Admin Knowledge Base & Threshold Control](#phase-7-super-admin-knowledge-base--threshold-control)
   - [Phase 8: Multi-Channel Section 7.3 Notifications & Live Weather](#phase-8-multi-channel-section-73-notifications--live-weather)
   - [Phase 9: PWA Installability, Offline Resilience & Accessibility](#phase-9-pwa-installability-offline-resilience--accessibility)
4. [Automated Verification Scripts](#4-automated-verification-scripts)
5. [Non-Technical 5-Minute Live Demo Script](#5-non-technical-5-minute-live-demo-script)

---

## 1. Test Credentials & Quick Access

The database is pre-seeded with realistic Punjab agrarian data (Samrala, Ludhiana):

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pankh.app` | `PankhAdmin2026!` | Full admin console access (`/admin`), knowledge base editor, vet directory manager, Sentinel threshold sliders. |
| **Demo Farmer** | `farmer@pankh.app` | `PankhAdmin2026!` | **Gurpreet Singh** — Active 1,200 Broiler flock (Day 22) in Samrala, Ludhiana, 14 days of historical check-ins, feed expenses, and rolling baseline. |
| **New Farmer** | *(Any new email)* | *(Any 6+ chars)* | Register via `/register` to test the full 3-minute onboarding wizard from scratch. |

- **Local Development URL**: [http://localhost:3000](http://localhost:3000)
- **Farmer Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 2. External Services & Architecture Map

Pankh connects to 8 industry-standard external cloud services. **All services are engineered with simulation fallbacks**, meaning the entire app works flawlessly even if you do not have external API keys configured!

```
                                  ┌────────────────────────┐
                                  │      Pankh Web App     │
                                  │   (Next.js 14 + PWA)   │
                                  └───────────┬────────────┘
                                              │
    ┌─────────────────┬─────────────────┬─────┴───────────┬─────────────────┬─────────────────┐
    ▼                 ▼                 ▼                 ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Neon DB +   │ │Google Gemini │ │ Google Cloud │ │OpenWeatherMap│ │ Google Maps  │ │    Twilio    │
│   pgvector   │ │  2.0 Flash   │ │  STT & TTS   │ │   Weather    │ │   Platform   │ │WhatsApp/SMS │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Detailed Breakdown of External Providers:

1. **Neon PostgreSQL with `pgvector`**
   - **Purpose**: Serverless cloud relational database storing users, farms, batches, daily health logs, alerts, transactions, and notifications.
   - **Why pgvector?**: Stores high-dimensional vector embeddings of approved poultry veterinary literature (PAU, ICAR, CPDO) for sub-second semantic search in Pankh AI.
   - **Config Key**: `DATABASE_URL`

2. **Google Gemini 2.0 Flash (`google/gemini-2.0-flash-001` / Direct Gemini API)**
   - **Purpose**: Generates grounded agrarian answers for Pankh AI, classifies farmer intent, and polishes economic insights into conversational Punjabi/Hinglish.
   - **Why Gemini?**: State-of-the-art multilingual comprehension for North Indian languages (Punjabi & Hindi), lightning-fast response times (~400ms), and **ultra-low token cost** (~97% cheaper than Claude 3.5 Sonnet, with a 100% free tier available on Google AI Studio).
   - **Config Keys**: `GEMINI_API_KEY` (Free Tier) or `OPENROUTER_API_KEY` with `OPENROUTER_MODEL="google/gemini-2.0-flash-001"`.
   - **Offline Fallback**: If keys are absent, Pankh runs an embedded deterministic veterinary synthesizer with ₹0 API cost.

3. **Google Cloud Speech-to-Text (STT) & Text-to-Speech (TTS)**
   - **Purpose**: Converts Punjabi/Hindi spoken voice notes into editable text and vocalizes advisory responses for low-literacy farmers.
   - **Fallback Chain**: Primary recognition in Punjabi (`pa-IN`) with automatic retry in Indian Hindi (`hi-IN`). Farmers always see and confirm the editable transcript before sending.
   - **Config Key**: `GOOGLE_CLOUD_API_KEY`

4. **OpenWeatherMap API**
   - **Purpose**: Fetches hyper-local outside ambient temperature and relative humidity using the farm's GPS coordinates.
   - **Poultry Heat Stress Index (THI)**: Evaluates formula `THI = 0.8 * T + (RH/100) * (T - 14.4) + 46.4` to calculate heat-stress risk (Normal / Moderate / High / Emergency).
   - **Optimization**: Cached in-memory for 3 hours (TTL) to avoid redundant API hits.
   - **Config Key**: `OPENWEATHER_API_KEY`

5. **Google Maps Platform**
   - **Purpose**: Farm onboarding village geocoding and the Pankh Connect interactive Vet/Lab directory map.
   - **Config Key**: `GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

6. **Twilio (WhatsApp & SMS Sandbox)**
   - **Purpose**: Dispatches urgent RED health alerts, Vet case status updates, and daily flock check-in reminders directly to farmer mobile phones per Section 7.3 notification policy.
   - **Dev / Simulation Mode**: If Twilio credentials are blank, Pankh logs formatted WhatsApp alert messages directly to the server terminal with sandbox join instructions.
   - **Config Keys**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

7. **Vercel Blob Storage**
   - **Purpose**: Secure cloud storage for farmer diagnostic flock photos, droppings images, and recorded voice notes.
   - **Config Key**: `BLOB_READ_WRITE_TOKEN`

8. **NextAuth.js (Auth.js v5)**
   - **Purpose**: Secure, session-based authentication using encrypted JSON Web Tokens (JWT) with role-based route protection (`FARMER` vs `SUPER_ADMIN`).
   - **Config Keys**: `NEXTAUTH_SECRET`, `AUTH_SECRET`, `NEXTAUTH_URL`

---

## 3. Step-by-Step Testing Guide: Phase 1 to Phase 9

---

### Phase 1: Authentication & Role-Based Access

#### 🎯 Goal:
Verify that registration, login, session cookies, and role separation (`FARMER` vs `SUPER_ADMIN`) function securely.

#### Step 1.1: Register a New Farmer
1. Open browser to [http://localhost:3000/register](http://localhost:3000/register).
2. Enter:
   - **Name**: `Harjeet Singh`
   - **Phone**: `9812345678`
   - **Email**: `harjeet.test@pankh.app`
   - **Password**: `TestPass2026!`
   - **Language**: Select **ਪੰਜਾਬੀ (Punjabi)**
3. Click **"ਰਜਿਸਟਰ ਕਰੋ / Create Account"**.
4. **Expected Output**:
   - Seamlessly redirects to `/onboarding/farm` (first-time farmer setup wizard).
   - A new User and Farmer record is created in the database.

#### Step 1.2: Login as Super Admin
1. Open [http://localhost:3000/login](http://localhost:3000/login).
2. Enter:
   - **Email**: `admin@pankh.app`
   - **Password**: `PankhAdmin2026!`
3. Click **"Sign In"**.
4. **Expected Output**:
   - Automatically detects `SUPER_ADMIN` role and redirects directly to `/admin`.
   - Admin navigation sidebar appears with Knowledge Base, Alert Rules, Vet Directory, and Audit Logs.

#### Step 1.3: Role Route Guard Protection
1. While logged in as `farmer@pankh.app`, attempt to type `/admin` in the browser address bar.
2. **Expected Output**:
   - Access denied! The system intercepts the unauthorized request and redirects safely back to `/dashboard` with an alert message.

---

### Phase 2: Farmer Onboarding & Shed Setup

#### 🎯 Goal:
Confirm that a farmer can set up their farm profile and active flock batch in under 3 minutes, with offline draft protection.

#### Step 2.1: Farm Profile Setup
1. Log in with a fresh farmer account or go to [http://localhost:3000/onboarding/farm](http://localhost:3000/onboarding/farm).
2. Enter:
   - **Farm Name**: `Khalsa Poultry Farm`
   - **State**: `Punjab`
   - **District**: `Ludhiana`
   - **Tehsil / Village**: `Samrala`
   - **Shed Type**: `Open-Sided Shed` (or Environment Controlled)
   - **Capacity**: `2000`
3. Click **"Next Step: Add Flock"**.

#### Step 2.2: Active Flock Batch Creation
1. In the Flock Batch step, enter:
   - **Batch Name**: `Batch 2026-A`
   - **Production Type**: `Broiler` (or Layer)
   - **Breed**: `Cobb 500`
   - **Initial Birds Placed**: `1500`
   - **Placement Date**: Select a date 14 days ago.
   - **Data Share Consent**: Check the box allowing sharing with verified vets.
2. Click **"Complete Setup & Open Dashboard"**.
3. **Expected Output**:
   - Farm and Batch records saved in Neon DB.
   - Redirects to `/dashboard` showing the active flock cycle gauge (Flock Day 15, 1,500 birds, 100% initial livability).

#### Step 2.3: Offline Resilience Test (Hard Rule #7)
1. In the onboarding form, type details into the fields.
2. Open DevTools (F12) -> **Network** tab -> Set throttling to **"Offline"**.
3. Click Submit or refresh the page.
4. **Expected Output**:
   - Amber offline banner appears: *"You are currently offline. Changes are saved locally and will sync when reconnected."*
   - None of your typed data is lost! When you reconnect to "No throttling", you can submit without retyping.

---

### Phase 3: Pankh AI Voice & Health Assistant

#### 🎯 Goal:
Verify that Pankh AI answers poultry queries strictly following the **6-Step Format**, **never makes a confirmed diagnosis**, cites **only retrieved sources**, and supports **Punjabi voice input**.

#### Step 3.1: Non-Emergency Health Query
1. Navigate to [http://localhost:3000/dashboard/ai](http://localhost:3000/dashboard/ai).
2. Type or paste this query:
   ```
   ਮੇਰੇ ਚੂਚਿਆਂ ਦੀਆਂ ਵਿੱਠਾਂ ਪਾਣੀ ਵਰਗੀਆਂ ਤੇ ਭੂਰੀਆਂ ਹੋ ਰਹੀਆਂ ਹਨ, ਕੀ ਕਰੀਏ?
   (Chicks have watery brownish droppings, what should we do?)
   ```
3. Click Send.
4. **Expected Output**:
   The response strictly adheres to the 6-Step Structure:
   1. **Answer**: Clear, compassionate Punjabi/Hinglish summary describing possible enteritis or feed moisture issues without asserting a definitive disease.
   2. **Why (1-3 Bullets)**: Explains damp litter, wet feed, or protozoal irritation.
   3. **What to do now (1-4 Actions)**: Inspect water nipples for leakage, provide electrolyte solution, inspect litter dry matter.
   4. **Ask (Follow-up)**: Clarifying question on chick age or feed brand.
   5. **Escalate**: `false` (Amber / Watch risk, no emergency).
   6. **Source**: Cites verified literature: e.g., *"PAU Ludhiana Poultry Disease Guide, Section 4.2"*.

#### Step 3.2: Red-Flag Critical Emergency Query
1. In the AI chat, submit this emergency query:
   ```
   Overnight 45 birds died suddenly in Shed 1. Some have twisted necks (torticollis) and severe gasping.
   ```
2. **Expected Output**:
   - **RED Alert Banner**: Flagged as `CRITICAL` risk immediately.
   - **Hard Rule #1 Check**: The AI **DOES NOT** say *"Your birds have Newcastle Disease"*. Instead, it says *"This symptom pattern (sudden high mortality with torticollis) indicates an acute neurological / respiratory condition requiring urgent laboratory confirmation."*
   - **Direct CTA Button**: An immediate **"Escalate to Nearby Vet / Lab"** button appears, pre-filling a triage case in Pankh Connect.

#### Step 3.3: Punjabi Voice Input Test
1. Click the **Microphone** icon on the AI chat input.
2. If prompted, allow microphone permissions.
3. Speak in Punjabi (or Hindi): *"ਮੁਰਗੀਆਂ ਦਾ ਦਾਣਾ ਘੱਟ ਖਾ ਰਹੀਆਂ ਹਨ"* (Birds are eating less feed).
4. **Expected Output**:
   - Visible audio pulsing waveform animation.
   - Transcript preview appears with language badge: `Detected: ਪੰਜਾਬੀ (pa-IN) • 94% Confidence`.
   - The transcript is **fully editable** by the farmer before sending (Hard Rule #6).

---

### Phase 4: Pankh Sentinel Early Disease Surveillance

#### 🎯 Goal:
Verify daily flock health logging, comparison against 7-day rolling baselines, microclimate heat-stress factoring, and automated alert scoring.

#### Step 4.1: Submit a Daily Flock Check-in
1. Navigate to [http://localhost:3000/dashboard/sentinel/checkin](http://localhost:3000/dashboard/sentinel/checkin).
2. Notice the top banner:
   - **Left**: Outside Weather via OpenWeatherMap (e.g., `32°C • Sunny • 45% Humidity`).
   - **Right**: Shed Thermometer input field (clearly distinguished per brief).
3. Fill in the daily metrics:
   - **Mortality**: `2` (normal baseline)
   - **Feed Intake**: `120` kg
   - **Water Intake**: `280` litres
   - **Shed Temperature**: `28` °C
   - **Physical Symptoms**: Leave unselected (Healthy).
4. Click **"Submit Check-in"**.
5. **Expected Output**:
   - Status: **GREEN / NORMAL**.
   - Composite risk score: `< 15 points`.
   - Living flock count in DB decrements by 2.
   - Timeline chart updates with today's data point.

#### Step 4.2: Simulate an Urgent RED Disease Spike
1. Go back to `/dashboard/sentinel/checkin`.
2. Enter an alarming drop in metrics:
   - **Mortality**: `35` birds
   - **Feed Intake**: `60` kg (50% drop from baseline!)
   - **Water Intake**: `120` litres
   - **Shed Temperature**: `39` °C (Severe heat stress!)
   - **Symptoms**: Check **"Gasping / Respiratory"** and **"Lethargy"**.
3. Click Submit.
4. **Expected Output**:
   - Status: **RED / URGENT (Score > 60)**.
   - Detailed Risk Breakdown shows elevated points for mortality, feed drop, and ambient heat stress (THI).
   - An automated **Case Record** is generated for Pankh Connect.
   - Action buttons appear: `[Contact Vet]`, `[Mark Resolved]`, `[Still Happening]`.

---

### Phase 5: Pankh Connect Vet Teleconsultation & Escalation

#### 🎯 Goal:
Verify geospatial discovery of verified poultry vets/labs, farmer data-sharing consent, and Twilio WhatsApp dispatch.

#### Step 5.1: Browse Nearby Experts
1. Open [http://localhost:3000/dashboard/connect](http://localhost:3000/dashboard/connect).
2. Observe the directory sorted by road distance from Samrala, Ludhiana:
   - **GADVASU Poultry Disease Diagnostic Lab** (Ludhiana) — ~32 km
   - **Dr. Harpreet Singh, M.V.Sc.** (Poultry Specialist) — ~14 km
   - **Punjab State Animal Health Dispensary** — ~6 km
3. Click on **Filter**: Toggle between `Veterinarian`, `Diagnostic Lab`, and `Pharmacy`.

#### Step 5.2: Create Escalation Case with Consent
1. Click **"Request Consultation"** next to Dr. Harpreet Singh.
2. Review the pre-populated case summary:
   - Includes current flock age (Day 22), 35 mortality, gasping symptoms, and ambient weather.
3. Check the mandatory consent box: *"I consent to share this anonymized flock data with Dr. Harpreet Singh."*
4. Click **"Send Case via WhatsApp"**.
5. **Expected Output**:
   - Case status updates to `CONTACTED`.
   - In dev mode, the terminal displays the formatted WhatsApp dispatch:
     ```
     [Pankh Connect / Twilio Simulation] Dispatching WHATSAPP to +919876543210:
     *Pankh Poultry Alert | ਪੰਖ*
     Case Initiated: 35 mortality spike reported in Samrala, Ludhiana.
     ```

---

### Phase 6: Pankh Farm Economics & Margin Engine

#### 🎯 Goal:
Verify deterministic financial calculations, explicit assumption labels (Rule #5), and zero LLM hallucination of financial numbers.

#### Step 6.1: Record a Farm Expense
1. Navigate to [http://localhost:3000/dashboard/economics](http://localhost:3000/dashboard/economics).
2. Click **"+ Add Transaction"** (or use Quick Entry).
3. Enter:
   - **Type**: `Expense`
   - **Category**: `Feed (Starter / Grower)`
   - **Amount**: `₹45,000`
   - **Quantity**: `30 Bags (1,500 kg)`
   - **Date**: Today
4. Click **"Save Expense"**.

#### Step 6.2: Verify Deterministic Financial Calculations
1. On the Economics overview page, observe the real-time financial cards:
   - **Total Batch Cost**: `₹45,000 + previous expenses`.
   - **Feed Cost Share**: Correctly computed percentage (e.g., `68.4% of total costs`).
   - **Cost Per Bird Placed**: `Total Cost ÷ Initial Birds Placed`.
   - **Cost Per Surviving Bird**: `Total Cost ÷ (Initial Birds - Total Mortality)`.
2. Notice the **Explicit Assumption Labels** (Hard Rule #5):
   - Any figure with incomplete data displays an explicit tag: e.g., *"Assumed meat sale price: ₹95/kg (estimated from Ludhiana mandi benchmark)"*.

---

### Phase 7: Super Admin Knowledge Base & Threshold Control

#### 🎯 Goal:
Verify that admins can ingest literature, adjust alert thresholds, manage experts, and view audit trails without code redeployment.

#### Step 7.1: Super Admin Console
1. Log in as `admin@pankh.app` / `PankhAdmin2026!` at [http://localhost:3000/login](http://localhost:3000/login).
2. Go to [http://localhost:3000/admin](http://localhost:3000/admin).

#### Step 7.2: Dynamically Adjust Alert Thresholds
1. Click **"Alert Rules & Thresholds"** in the sidebar.
2. Locate **"Daily Mortality Urgent Rate (%)"**. Change the slider from `1.5%` to `2.0%`.
3. Locate **"Composite Risk Urgent (Red) Threshold"**. Change from `60` to `65`.
4. Click **"Save Rules"**.
5. **Expected Output**:
   - Settings persist in Neon DB (`AlertRule` table).
   - The Sentinel risk engine immediately evaluates subsequent check-ins using the new thresholds **without restarting the Next.js server**!

#### Step 7.3: Knowledge Base Management
1. Click **"Knowledge Base"** in the admin sidebar.
2. Click **"+ Ingest Approved Source"**.
3. Enter:
   - **Title**: `GADVASU Heatwave Protocol 2026`
   - **Authority**: `GADVASU Ludhiana`
   - **Topic**: `Heat Stress & Shed Foggers`
   - **Content**: Guidance on using electrolytes in drinking water during hot summer afternoons.
4. Click **"Ingest & Generate Vector Embeddings"**.
5. **Expected Output**: Source is saved and becomes instantly retrievable by Pankh AI.

---

### Phase 8: Multi-Channel Section 7.3 Notifications & Live Weather

#### 🎯 Goal:
Verify automated in-app and external notifications matching Section 7.3 policy.

#### Policy Matrix Verification:
| Trigger Event | In-App Bell | WhatsApp Alert | SMS Fallback |
| :--- | :---: | :---: | :---: |
| **Daily Check-in Due** | ✅ Yes | Optional (1/day max) | ❌ No |
| **AMBER Notice** | ✅ Yes | ❌ Muted (No spam) | ❌ No |
| **RED Health Alert** | ✅ Yes | ✅ Immediate | ✅ If WhatsApp fails |
| **Vet Case Update** | ✅ Yes | ✅ Immediate | ❌ No |
| **Vaccine Due Today**| ✅ Yes | ✅ Immediate | ❌ No |
| **Weekly Economics** | ✅ Yes (1/week) | ❌ No | ❌ No |

#### Step 8.1: Test Notification Bell
1. In the farmer header, click the **Notification Bell** icon (top right).
2. Notice the badge count and unread notification items.
3. Click on any notification to navigate directly to the relevant screen (`/dashboard/sentinel` or `/dashboard/connect`).
4. Click **"Mark All as Read"**. Badge count clears to zero.

---

### Phase 9: PWA Installability, Offline Resilience & Accessibility

#### 🎯 Goal:
Confirm PWA manifest, service worker caching, high-contrast severity badges, and screen-reader accessibility.

#### Step 9.1: PWA Audit in Chrome DevTools
1. Open DevTools (F12) -> **Application** tab.
2. Click **Manifest**:
   - **Name**: `Pankh — Punjab Poultry Farm Intelligence`
   - **Short Name**: `Pankh | ਪੰਖ`
   - **Start URL**: `/dashboard`
   - **Display**: `standalone`
   - **Icons**: 192x192 & 512x512 maskable SVG icons present.
3. Click **Service Workers**:
   - `sw.js` is registered and active (`status: activated and running`).

#### Step 9.2: Accessible Status Badges
1. Visit `/dashboard/sentinel`.
2. Inspect any severity badge (Green, Amber, Red).
3. **Expected Output**:
   - Severity is **never conveyed by color alone** (WCAG 2.1 AA requirement).
   - Each badge includes a distinct icon (ShieldCheck, AlertTriangle, Flame) and an explicit text label with `role="status"` and `aria-label`.

---

## 4. Automated Verification Scripts

You can run automated end-to-end tests from the terminal at any time:

### Run Phase 8 & 9 Integration Verification Suite:
```bash
npx tsx scripts/test-phase8-scenarios.ts
```
**Expected Terminal Output**:
```text
===============================================================
🚀 STARTING PANKH PHASE 8 & 9 INTEGRATION VERIFICATION TESTS
===============================================================

--- 1. Testing Poultry THI & Heat Stress Categorization ---
✅ [PASS] Comfort Zone (26°C, 45% RH) produces NORMAL risk
✅ [PASS] Warm Zone (33°C, 50% RH) triggers heat stress notice
✅ [PASS] Heatwave (41°C, 60% RH) triggers EMERGENCY heat prostration risk

--- 2. Testing Weather Fetch & In-Memory TTL Cache ---
✅ [PASS] Weather service returns valid meteorological data
✅ [PASS] Repeated weather query served from in-memory TTL cache

--- 3. Testing Risk Engine Ambient Heat Stress Integration ---
✅ [PASS] Risk engine elevates environmental points under compound heat stress
✅ [PASS] Risk engine reasons explicitly cite ambient THI and thermal prostration

--- 4. Testing Section 7.3 Notification Dispatchers ---
✅ [PASS] AMBER Alert dispatches in-app notification ONLY (no external WhatsApp)
✅ [PASS] RED Alert dispatches in-app notification AND WhatsApp alert
✅ [PASS] Vet Case Status Update triggers in-app + WhatsApp dispatch
✅ [PASS] Notification record persisted in PostgreSQL database

--- 5. Testing Vaccination Schedule Catalog ---
✅ [PASS] VaccinationSchedule model query succeeds in Prisma Client

===============================================================
📊 TEST RESULTS: 12 PASSED, 0 FAILED
===============================================================
```

### Run Strict TypeScript Typecheck:
```bash
npx tsc --noEmit
```
**Expected Output**: Exit code `0` with 0 errors.

---

## 5. Non-Technical 5-Minute Live Demo Script

Follow this exact 5-step script when presenting Pankh live to an evaluator or investor:

1. **Minute 1: The Problem & Dashboard Overview** (`/dashboard`)
   - Log in as `farmer@pankh.app`.
   - Point to the **Punjabi-first agrarian UI**, the active Cobb 500 Broiler flock cycle gauge (Day 22), and the **Live Ambient Weather** card (32°C, Sunny, Ludhiana).
   - Explain how smallholder poultry farmers previously lacked early warning tools.

2. **Minute 2: Daily Check-in & Microclimate Risk Engine** (`/dashboard/sentinel/checkin`)
   - Click **"ਰੋਜ਼ਾਨਾ ਚੈੱਕ-ਇਨ / Daily Check-in"**.
   - Show how a farmer logs mortality, feed, and water in **under 45 seconds**.
   - Point out how the outdoor temperature is retrieved automatically from OpenWeatherMap and combined with the shed reading into the **Poultry Heat Stress Index (THI)**.

3. **Minute 3: Voice-Powered AI Assistant with Strict Guardrails** (`/dashboard/ai`)
   - Click the microphone icon or type a query in Punjabi.
   - Show the **strict 6-step answer format**: *Answer → Why → What to do → Clarifying question → Escalation flag → Verified citation*.
   - Emphasize that **Pankh AI never hallucinates or makes a confirmed diagnosis** — it protects farmers and directs them to veterinarians.

4. **Minute 4: Vet & Lab Escalation** (`/dashboard/connect`)
   - Trigger a RED alert or open Pankh Connect.
   - Show the verified directory of veterinary experts and GADVASU diagnostic labs mapped with driving distances.
   - Demonstrate the **farmer consent toggle** before any flock data is transmitted via WhatsApp.

5. **Minute 5: Farm Economics & Admin Governance** (`/dashboard/economics` & `/admin`)
   - Open Economics: Show batch profit, cost per bird, and feed cost share with **explicitly labeled assumptions**.
   - Log in as `admin@pankh.app` at `/admin` to demonstrate how university veterinarians can adjust alert sensitivity thresholds and ingest new research without needing a software engineer to redeploy code.
