# Pankh (ਪੰਖ) — Punjab Poultry Farm Intelligence & Early Disease Sentinel

> **A Punjabi-first, offline-resilient poultry farm operating platform designed to prevent catastrophic flock disease mortality and protect farmer margins across Punjab's broiler and layer belt.**

👉 **[Read the Complete Product Requirements Document & Client Guide (PRD.md)](./PRD.md)** for a non-technical walkthrough, feature breakdowns, and test guides.

---

## 🌾 The Problem
Punjab produces over 30 crore broilers annually. Yet small-to-midsize poultry farmers face crippling disease risks from Newcastle Disease (Ranikhet), Infectious Bursal Disease (Gumboro), and extreme summer heat-stress prostration. When symptoms emerge:
- Farmers turn to informal medicine shops or unverified WhatsApp groups, resulting in indiscriminate antibiotic use.
- Vet colleges (such as GADVASU Ludhiana) are contacted only after mortality crosses 10-20%.
- Commercial farm software is written in technical English, requires desktop computers, and fails in low-connectivity shed environments.

**Pankh solves this with a Punjabi-first, mobile-first Progressive Web App (PWA) operating across 4 tightly coupled modules.**

---

## 🏛️ The Four Core Modules

```
                        ┌──────────────────────────────────────────────┐
                        │              PANKH PLATFORM                  │
                        └──────┬───────────────┬───────────────┬───────┘
                               │               │               │
        ┌──────────────────────▼──────┐ ┌──────▼────────┐ ┌────▼────────────────────────┐
        │          PANKH AI           │ │PANKH SENTINEL │ │        PANKH CONNECT        │
        │ • 6-Step Answer Architecture│ │ • 60s Check-in│ │ • Geospatial Vet Directory  │
        │ • Deterministic Red Flags   │ │ • 7-Day Radar │ │ • Twilio WhatsApp Dispatch  │
        │ • pa-IN / hi-IN Voice STT   │ │ • Weather THI │ │ • Informed Consent Modal    │
        │ • pgvector RAG Retrieval    │ │ • Triage Rules│ │ • Case Stepper Lifecycle    │
        └─────────────────────────────┘ └───────────────┘ └─────────────────────────────┘
                               │               │               │
                        ┌──────▼───────────────▼───────────────▼───────┐
                        │            PANKH FARM ECONOMICS              │
                        │ • Flock Ledger (Expenses & Bird Harvests)   │
                        │ • Cost Per Surviving Bird • Mortality Loss   │
                        │ • FCR & Margin Projections with Assumptions  │
                        └──────────────────────────────────────────────┘
```

### 1. Pankh AI (Veterinary Assistant)
- **Hard Rule #1**: The AI **NEVER** claims a confirmed disease diagnosis. It describes symptom patterns, classifies urgency (Normal / Watch / Urgent), and connects farmers to certified veterinarians.
- **Strict 6-Step Answer Format**: Every response adheres to:
  $$\text{Answer} \longrightarrow \text{Why (1-3 bullets)} \longrightarrow \text{What to do now} \longrightarrow \text{Ask} \longrightarrow \text{Escalate} \longrightarrow \text{Source}$$
- **Zero Hallucination Retrieval (RAG)**: Only approved sources (ICAR, GADVASU, CPDO) stored as 1536-dimensional pgvector embeddings are cited.
- **Punjabi Voice QA Pass**: Multi-stage speech recognition (`pa-IN` primary with `hi-IN` fallback) that always allows the farmer to review and edit the transcript before submitting.

### 2. Pankh Sentinel (Early Disease Surveillance Radar)
- **60-Second Daily Check-in**: Fast logging of mortality, feed consumption, water intake, symptoms, and indoor shed temperature.
- **Rolling 7-Day Baselines**: Compares daily flock inputs against moving medians to detect sub-clinical deviations days before visible mortality surges.
- **Live Weather & Heat-Stress Engine**: Integrates OpenWeatherMap with in-memory TTL caching to calculate the poultry Temperature-Humidity Index (THI):
  $$\text{THI} = 0.8 \times T + \frac{\text{RH}}{100} \times (T - 14.4) + 46.4$$
  Factors ambient summer thermal load directly into the disease-risk engine.

### 3. Pankh Connect (Veterinary Escalation & Directory)
- **Punjab Poultry Care Directory**: Geospatial matching of certified veterinarians, disease diagnostic laboratories, and poultry farmers' associations across Ludhiana, Sangrur, Patiala, and Jalandhar.
- **Informed Consent Gate (Hard Rule #6)**: Farmer's phone number, flock size, and 7-day trend summary are transmitted via WhatsApp **only after** explicit farmer modal authorization.
- **Direct WhatsApp Dispatcher**: Native Click-to-Chat deep link (`wa.me`) with structured bilingual clinical summary, zero third-party subscription costs, and native fallback.

### 4. Pankh Farm Economics (Flock Cost & Profit Ledger)
- **Flock Financial Metrics**: Real-time tracking of Total Batch Cost, Feed Cost Share (%), Revenue, Gross Margin, and Cost per Surviving Bird.
- **Explicit Assumptions (Hard Rule #5)**: When input data is incomplete, figures are explicitly labeled (*"Estimated", "Assuming ₹110/kg market rate"*).
- **Mortality Loss Calculator**: Quantifies the rupee cost of flock mortality, motivating early disease intervention.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion
- **Database & ORM**: PostgreSQL (Neon Serverless) with `pgvector` extension + Prisma ORM
- **Authentication**: NextAuth.js v5 (Credentials with bcrypt hashing and RBAC)
- **LLM & Embeddings**: OpenRouter (`anthropic/claude-3.5-sonnet`, `deepseek/deepseek-chat`) + pgvector cosine similarity
- **Speech**: Google Cloud Speech-to-Text (`pa-IN` / `hi-IN`) and Text-to-Speech
- **External Integrations**: OpenWeatherMap API, Google Maps Platform, Twilio WhatsApp / SMS API
- **PWA & Offline**: Web App Manifest, Service Worker (`public/sw.js`), and localStorage dual-layer draft persistence

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/anshu762/PANKH-Website.git
cd PANKH-Website
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file and fill in your API credentials:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed
Push the Prisma schema to your PostgreSQL / Neon instance and run the seed script:
```bash
npx prisma db push
npx prisma db seed
```
*Seeds the Super Admin account, 17 pgvector knowledge chunks, 18 Sentinel alert rules, Punjab vet/lab directory, 7-day demo flock baseline, and standard poultry vaccination schedules.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Environment Variables Guide

| Variable | Description | Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string (with pgvector) | [Neon Console](https://neon.tech) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | 32-character random string for session encryption | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application base URL (`http://localhost:3000`) | Self-hosted or Vercel URL |
| `OPENROUTER_API_KEY` | LLM API key for veterinary assistant queries | [OpenRouter](https://openrouter.ai) |
| `OPENWEATHER_API_KEY` | Live hyper-local microclimate weather context | [OpenWeatherMap](https://openweathermap.org/api) |
| `GOOGLE_CLOUD_API_KEY` | Speech-to-Text (`pa-IN` / `hi-IN`) voice input | [Google Cloud Console](https://console.cloud.google.com) |
| `DIRECT_WHATSAPP` | Built-in zero-cost Click-to-Chat engine (`wa.me`) | Native (No API key needed) |

---

## 🧪 Verification & Automated Testing

Run the end-to-end integration test suites:
```bash
# Test Phase 8 & 9 (Weather, THI, STT fallback, Notifications, PWA)
npx tsx scripts/test-phase8-scenarios.ts

# Test Phase 7 (Admin console, rules, knowledge vector index)
npx tsx scripts/test-phase7-admin-scenarios.ts

# Run TypeScript compiler verification
npx tsc --noEmit
```

---

## 🎬 2-3 Minute Live Demo Walkthrough Script

Use this sequence to present Pankh during live evaluations or portfolio demonstrations:

1. **The Agrarian Landing Page (`/`)**:
   - Point out the Gurmukhi / Punjabi typography, mustard field color palette, and language switcher (ਪੰਜਾਬੀ, English, हिंदी).
   - Click **"ਕਿਸਾਨ ਲੌਗਇਨ (Farmer Login)"** and sign in with `farmer@pankh.app` (Password: `PankhAdmin2026!`).

2. **Farmer Dashboard & Live Pulse Bar (`/dashboard`)**:
   - Highlight the **Live Weather Pulse Bar**: Show real-time temperature (34°C), humidity, and poultry heat-stress index (THI).
   - Point to the **In-App Notification Bell** in the top navigation: Open it to show automated check-in and vaccination alerts.
   - Show the **Active Batch Card** (Day 21 Broiler flock, 2,962 live birds).

3. **Pankh AI Assistant (`/dashboard/ask`)**:
   - Switch to the **Voice Tab**: Tap the microphone button. Point out the `pa-IN` $\to$ `hi-IN` fallback engine.
   - Show the editable transcript box: Demonstrate that the farmer can edit any term before sending (Hard Rule #1: never silently guess).
   - Submit: *"Shed number 2 vich chooje sust ne"* $\to$ inspect the strict **6-Step Answer Card** with verified citations.

4. **Sentinel 60-Second Check-in (`/dashboard/sentinel/checkin`)**:
   - Show the **Ambient Outdoor Weather Box** (clearly distinguished from the indoor shed thermometer reading).
   - Enter daily values (Mortality: 3, Feed: 135 kg, Water: 270 L, Temp: 31°C).
   - Demonstrate offline resilience: Disconnect internet in DevTools $\to$ notice the floating `<OfflineBanner />` and zero data loss on submit error.
   - Reconnect and submit $\to$ view the **Sentinel Disease Risk Radar (`/dashboard/sentinel`)** with rolling 7-day median baseline comparisons.

5. **Pankh Connect Escalation (`/dashboard/connect`)**:
   - View nearby verified Punjab veterinarians (e.g. Dr. Harpreet Singh at GADVASU, 8.4 km away).
   - Click **"Share via WhatsApp"** $\to$ highlight the **Informed Consent Modal** displaying exact data points to be shared before dispatch.

6. **Farm Economics Ledger (`/dashboard/economics`)**:
   - Inspect the **Flock Ledger**: Breakdown of feed (71%), chicks, medicine, and electricity.
   - Point out the **Cost per Surviving Bird** (₹84/bird) and the explicit *"Estimated"* label with financial assumptions.

7. **Admin Console (`/admin`)**:
   - Log in as Super Admin (`admin@pankh.app`).
   - Open `/admin/rules` $\to$ demonstrate adjusting mortality alert thresholds dynamically without redeploying code.
   - Open `/admin/knowledge` $\to$ show the 1536-dimensional pgvector chunk re-indexer.

---

## 🔮 Production Roadmap & Known Boundaries

As specified in the architecture principles, the following features are intentionally out of scope for the MVP and slated for subsequent production releases:
- **Acoustic Cough Analysis**: Audio classification using specialized shed acoustic sensors.
- **IoT Hardware Sensor Telemetry**: Automated RS-485 / Modbus integration for automatic feeder and shed temperature probes.
- **Direct Vet Portal**: Independent login and EHR prescription workflows for veterinarians.
- **Enterprise Integrator Workflows**: Multi-farm enterprise dashboards for corporate integrators (Suguna, Venky's, IB Group).

---

## 📄 License
Built for Punjab Poultry Farmers. Licensed under the [MIT License](LICENSE).
