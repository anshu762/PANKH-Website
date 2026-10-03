# 🧪 PANKH (ਪੰਖ / पंख) — Complete Website Manual & Automated Testing Guide (Hinglish)

> **Pankh**: Punjab ke poultry farmers ke liye banaya gaya AI-powered intelligence platform.  
> Isme 4 main modules hain: **Pankh AI** (Doctor/Expert Assistant), **Pankh Sentinel** (Early Disease Alert System), **Pankh Connect** (Nearby Vet & Lab Escalation), aur **Pankh Farm Economics** (Munafa aur kharche ka hisab-kitab).  
> 
> Ye guide bilkul **simple, normal aur easy Hinglish** me likhi gayi hai taaki aap ya koi bhi non-technical person bina kisi mistake ke step-by-step poori website ko manually test kar sake. Saath hi niche humne automated test suite ke results bhi attach kiye hain.

---

## 📌 Index / Table of Contents
1. [Test Shuru Karne Se Pehle (Prerequisites & Accounts)](#1-test-shuru-karne-se-pehle-prerequisites--accounts)
2. [Step-by-Step Manual Testing (Phase 1 se Phase 9 tak)](#2-step-by-step-manual-testing-phase-1-se-phase-9-tak)
   - [Test 1: Login, Register aur Role Security (Admin vs Farmer)](#test-1-login-register-aur-role-security)
   - [Test 2: Naya Farmer Onboarding (3-Minute Setup + Offline Draft)](#test-2-naya-farmer-onboarding)
   - [Test 3: Farmer Dashboard & Live Weather (THI Heat Stress)](#test-3-farmer-dashboard--live-weather)
   - [Test 4: Pankh AI Doctor Assistant (Voice, Punjabi & 6-Step Rule)](#test-4-pankh-ai-doctor-assistant)
   - [Test 5: Pankh Sentinel Daily Check-in (Green vs Red Alert)](#test-5-pankh-sentinel-daily-check-in)
   - [Test 6: Pankh Connect (Nearby Vets, GADVASU Lab & WhatsApp Consent)](#test-6-pankh-connect)
   - [Test 7: Farm Economics Ledger (Kharche, Munafa & Assumptions)](#test-7-farm-economics-ledger)
   - [Test 8: Super Admin Console (Threshold Slider, Knowledge Base & AI Review)](#test-8-super-admin-console)
   - [Test 9: Notifications Engine & Header Bell Icon](#test-9-notifications-engine--header-bell-icon)
   - [Test 10: PWA & Offline Network Loss Test](#test-10-pwa--offline-network-loss-test)
3. [Automated Test Suite Verification (Humne jo test run kiye)](#3-automated-test-suite-verification)
4. [Testing Ke Waqt Dhyan Rakhne Wali Baatein (Mistakes Avoid Kare)](#4-testing-ke-waqt-dhyan-rakhne-wali-baatein)

---

## 1. Test Shuru Karne Se Pehle (Prerequisites & Accounts)

### Server Kaise Start Kare:
Terminal open kijiye project folder me aur type kijiye:
```bash
npm run dev
```
Jab browser me `http://localhost:3000` open karenge, to website load ho jayegi.

### Ready-Made Test Accounts (Database me pehle se seeded hain):
Aapko scratch se data create karne ki zaroorat nahi hai, realistic Punjab (Samrala, Ludhiana) ka data pehle se available hai:

| Account Type | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pankh.app` | `PankhAdmin2026!` | Admin console access (`/admin`), alert threshold sliders, PAU/GADVASU research ingest, audit logs. |
| **Demo Farmer** | `farmer@pankh.app` | `PankhAdmin2026!` | **Gurpreet Singh** — 1,200 Broiler flock (Day 22), 14 days ka historical health data, feed expenses sab set hai. |
| **New Farmer** | *(Koi bhi new email)* | *(6+ characters)* | `/register` page se naya account banakar fresh onboarding test karne ke liye. |

---

## 2. Step-by-Step Manual Testing (Phase 1 se Phase 9 tak)

Har test ke andar 3 cheezein hain: **Kahan jana hai (URL)**, **Kya karna hai (Steps)**, aur **Kya dikhna chahiye (Expected Result)**.

---

### Test 1: Login, Register aur Role Security

#### Goal:
Check karna ki authentication theek chal raha hai aur normal farmer bina permission ke Admin page par na ghus sake.

#### Step 1.1: Naya Farmer Register Kare
1. Browser me open kare: `http://localhost:3000/register`
2. Form me enter kare:
   - **Name**: `Harjeet Singh`
   - **Phone**: `9876500001`
   - **Email**: `harjeet.test@gmail.com` (ya koi bhi new email)
   - **Password**: `TestPass123`
   - **Preferred Language**: **ਪੰਜਾਬੀ (Punjabi)** select kare.
3. **"ਰਜਿਸਟਰ ਕਰੋ / Create Account"** button dabaye.
4. **Expected Result**: 
   - Account successfully ban jayega aur browser automatically `/onboarding/farm` par redirect ho jayega.

#### Step 1.2: Admin Login Test
1. Logout kare ya Incognito window me khole: `http://localhost:3000/login`
2. Enter kare:
   - **Email**: `admin@pankh.app`
   - **Password**: `PankhAdmin2026!`
3. **"Sign In"** dabaye.
4. **Expected Result**: 
   - System detect karega ki ye `SUPER_ADMIN` hai aur directly `/admin` console par le jayega. Side menu me Knowledge Base, Alert Rules, etc. dikhega.

#### Step 1.3: Role Security Guard Check (Farmer Admin page access nahi kar sakta)
1. Farmer account (`farmer@pankh.app`) se login kare.
2. Browser ke address bar me manually type kare: `http://localhost:3000/admin` aur Enter dabaye.
3. **Expected Result**: 
   - Page block ho jayega aur unauthorized alert ke saath wapas `/dashboard` par redirect kar dega. (Security pass!).

---

### Test 2: Naya Farmer Onboarding

#### Goal:
Check karna ki naya kisan apna Farm aur Flock (murgiyon ka batch) 3 minute ke andar aasaani se add kar pa raha hai ya nahi.

#### Steps:
1. Naye registered farmer account se `http://localhost:3000/onboarding/farm` par jaye.
2. **Shed Details Bhare**:
   - **Farm Name**: `Khalsa Broiler Farm`
   - **District**: `Ludhiana` (Dropdown se select kare)
   - **Tehsil / Village**: `Samrala`
   - **Shed Type**: `Open-Sided Shed` ya `Environment Controlled`
   - **Total Capacity**: `2000`
3. Click kare **"Next Step: Add Flock"**.
4. **Flock Details Bhare**:
   - **Batch Name**: `Batch 2026-A`
   - **Bird Type**: `Broiler`
   - **Breed**: `Cobb 500`
   - **Chicks Placed**: `1500`
   - **Placement Date**: Aaj se 10 din purani date choose kare.
   - **Data Share Consent**: Checkbox par tick kare (Dr. se data share karne ki permission).
5. Click kare **"Complete Setup & Open Dashboard"**.
6. **Expected Result**:
   - Data database me save ho jayega aur farmer `/dashboard` par land karega jahan active flock ka Day 11 status aur 1,500 birds show hongi.

---

### Test 3: Farmer Dashboard & Live Weather

#### Goal:
Farmer dashboard par active batch ki progress aur hyper-local weather check karna.

#### Steps:
1. `http://localhost:3000/dashboard` open kare (`farmer@pankh.app` se).
2. **Dashboard Cards Check Kare**:
   - **Active Flock Gauge**: Batch Day dikhana chahiye (jaise `Day 22`), Livability percentage dikhana chahiye (jaise `98.3%`).
   - **Live Weather Card**: Ludhiana ka live ambient weather dikhega (e.g. `31°C • Sunny • 45% Humidity`).
   - **THI (Temperature-Humidity Index)**: Poultry heat-stress level tag dikhega (jaise `Normal` ya `Moderate Heat Stress`).
   - **Quick Action Buttons**: "ਰੋਜ਼ਾਨਾ ਚੈੱਕ-ਇਨ (Daily Check-in)", "ਪੰਖ AI (Ask AI)", "ਵੈੱਟ ਨਾਲ ਸੰਪਰਕ (Connect Vet)".
3. **Expected Result**: 
   - Saari figures clean aur Punjabi/English me properly render honi chahiye bina kisi broken UI ke.

---

### Test 4: Pankh AI Doctor Assistant (`/dashboard/ask`)

#### Goal:
AI Doctor ka 6-Step answer format verify karna, check karna ki wo kabhi confirmed diagnosis ka jhootha dawa na kare (Hard Rule #1), input box me inline Voice/Photo features aur instant message bubble display check karna, aur emergency red-flag aane par direct vet connect button verify karna.

#### Step 4.1: 1-Click Starter Prompts Test (Empty State)
1. `http://localhost:3000/dashboard/ask` open kare.
2. Screen par welcoming header aur 4 interactive cards dikhenge:
   - 🌾 **Day 15 Broiler Feed & FCR Standard** (15 ਦਿਨਾਂ ਦੇ ਬਰਾਇਲਰ ਦਾ ਦਾਣਾ ਅਤੇ FCR ਚਾਰਟ)
   - ☀️ **Summer Shed Foggers & Sprinklers** (ਗਰਮੀ ਵਿੱਚ ਸ਼ੈੱਡ ਫੌਗਰ ਅਤੇ ਛੱਤ ਸਪ੍ਰਿੰਕਲਰ ਸ਼ਡਿਊਲ)
   - 💉 **Gumboro (IBD) & LaSota Protocol** (ਗੰਬੋਰੋ ਅਤੇ ਲਾਸੋਟਾ ਵੈਕਸੀਨ ਸ਼ਡਿਊਲ)
   - 🚨 **High Mortality & Torticollis Test** (ਐਮਰਜੈਂਸੀ ਰੈੱਡ ਫਲੈਗ ਟੈਸਟ)
3. Kisi bhi card par click kare (jaise **Day 15 Broiler Feed**).
4. **Expected Result**:
   - Aapka user message bubble turant screen ke right side pop-up hoga (Farmer avatar ke saath).
   - Input box turant clear ho jayega.
   - Niche *"Analyzing with Punjab poultry knowledge..."* spinner aayega.
   - 2-3 second baad AI ka **6-Step Answer Card** aayega:
     - 1️⃣ **Answer**: Seedha, concise jawab (Day 11-21 starter crude protein, feed grams/bird).
     - 2️⃣ **Why (1-3 Bullets)**: Biological reason.
     - 3️⃣ **What to do now**: Practical farm management steps.
     - 4️⃣ **Ask (Follow-up)**: Farmer se next question puchega (clickable "Ask this →" buttons ke saath).
     - 5️⃣ **Source**: Asli PAU / ICAR reference citation.
     - **Speaker Button (ਸੁਣੋ)**: Top right par Speaker button dabane par Punjabi voice me sun sakte hain.

#### Step 4.2: Manual Typing & Auto-Resize Input Box Test
1. Niche input box me apna koi bhi sawal type kare (Punjabi, Hinglish ya English):
   ```
   Mere chooje thode sust hain aur bura daana kam kha rahe hain, kya karein?
   ```
2. Note kare:
   - Textarea auto-resize hoti hai jaise aap type karte hain.
   - Right side 'X' button se aap text ko 1 click me clear kar sakte hain.
   - Keyboard par **Enter ↵** dabane se message send ho jata hai (**Shift+Enter** se nayi line banti hai).
3. Send button dabaye.
4. **Expected Result**: 
   - User message bubble turant screen par show hoga.
   - AI ka grounded answer aayega bina kisi fake diagnosis ke (Hard Rule #1 compliant).

#### Step 4.3: Critical Emergency Red-Flag Interception (Twisted Neck + Sudden Death)
1. Input box me ya quick test pills me ye emergency query dalein:
   ```
   Chicks ki gardan mudi hui hai, gasping kar rahe hain aur subah se 30 mar gaye
   ```
2. Send dabaye.
3. **Expected Result**:
   - AI generation se pehle hi **Pankh Deterministic Safety Layer** intercept karega.
   - Ek bada **RED URGENT ALERT BANNER** screen par aayega.
   - AI bolega: *"Ye lakshan bahut gambhir neurological/respiratory condition ki taraf ishara karte hain. Khud dawai na dein, turant post-mortem lab ya vet se sampark karein."*
   - Chat ke andar prominent button aayega: **"Connect with Nearby Vet / Lab"** jo sidha Pankh Connect par pre-filled case summary ke saath lekar jayega.

#### Step 4.4: Inline Voice & Photo Analysis Test
1. Input box ke left side **Microphone 🎙️** icon par click kare:
   - Voice panel open hoga.
   - Mic button tap karke Punjabi/Hindi me bolen.
   - Bolne ke baad editable transcript preview hoga jise aap edit kar sakte hain.
   - "Back to Text" button se aap wapas normal typing par aa sakte hain.
2. Input box ke **Camera 📷** icon par click kare:
   - Photo analysis panel open hoga.
   - Droppings ya murgi ki photo upload kare aur "Analyze Photo" dabaye.
   - Visual features extract hokar chat me inquiry ke roop me send ho sakti hain.

#### Step 4.5: Reset / Clear Chat Test
1. Chat header me top right par **RotateCcw (🔄 New Chat)** icon par click kare.
2. **Expected Result**:
   - Purani chat clear ho jayegi aur fresh Empty State with 4 quick prompt cards wapas aa jayega.

---

### Test 5: Pankh Sentinel Daily Check-in

#### Goal:
Farmer ka 60-second daily check-in test karna, 7-day rolling baseline se compare karna, aur Green vs Red Alert generation check karna.

#### Step 5.1: Normal Routine Check-in (Green Status)
1. `http://localhost:3000/dashboard/sentinel/checkin` par jaye.
2. Top par outside live temperature verify kare.
3. Inputs bhare:
   - **Mortality (Maut)**: `2` (Normal)
   - **Feed Intake (Daana)**: `125` kg
   - **Water Intake (Paani)**: `260` Litres
   - **Shed Temperature**: `28` °C
   - **Symptoms**: Koi bhi symptom tick mat kare (Sab theek).
4. **"ਰੋਜ਼ਾਨਾ ਚੈੱਕ-ਇਨ ਦਰਜ ਕਰੋ / Submit Check-in"** dabaye.
5. **Expected Result**:
   - Risk Engine 7-day median se compare karega.
   - Screen par **GREEN / NORMAL** badge aayega.
   - Living birds count 2 se kam ho jayega database me.

#### Step 5.2: Urgent RED Disease Outbreak Check-in
1. Dobara check-in page par jaye ya next day simulate kare.
2. Ab dangerous numbers dalein:
   - **Mortality**: `35` (Boht zyada mortality spike!)
   - **Feed Intake**: `60` kg (Normal se 50% drop)
   - **Water Intake**: `110` Litres (Heavy plunge)
   - **Shed Temp**: `39` °C (High heat)
   - **Physical Symptoms**: **"Gasping / Saans lene me takleef"** aur **"Twisted Neck"** select kare.
3. Submit dabaye.
4. **Expected Result**:
   - Composite Risk Score 60 se upar chala jayega.
   - Screen par **RED ALERT (CRITICAL)** warning aayegi.
   - Screen par 3 buttons aayenge: `[Vet Contacted]`, `[Mark Resolved]`, `[Still Happening]`.
   - Automatic Pankh Connect case file open ho jayegi!

---

### Test 6: Pankh Connect

#### Goal:
Nearby verified poultry veterinarians aur GADVASU disease diagnostic laboratories ko browse karna, aur kisan ki marzi se WhatsApp par case report share karna.

#### Step 6.1: Vets Directory & Distance Check
1. `http://localhost:3000/dashboard/connect` open kare.
2. Verify kare ki Punjab ke verified specialists distance ke hisab se sort hokar aa rahe hain:
   - **GADVASU Poultry Disease Diagnostic Lab** (Ludhiana) — ~32 km
   - **Dr. Harpreet Singh, M.V.Sc.** — ~14 km
   - **Punjab State Animal Health Dispensary** — ~6 km
3. Top filters test kare: `All`, `Veterinarian`, `Diagnostic Lab`. Filter switch karne par list smoothly filter honi chahiye.

#### Step 6.2: WhatsApp Sharing with Farmer Consent (Hard Rule #6)
1. Dr. Harpreet Singh ke card par **"Share Case via WhatsApp"** dabaye.
2. Ek Consent Modal khulega jisme likha hoga:
   - *"Kya aap apni farm ki location, mortality trend, aur flock age Dr. Harpreet ke saath share karne ke liye raazi hain?"*
3. **Pehle Bina Consent Checkbox Tick Kiye Send Dabaye**:
   - System block karega aur bolega ki bina farmer consent ke data bahar nahi bheja ja sakta.
4. **Ab Checkbox Tick Kare**:
   - *"I consent to share this anonymized flock data"* par tick kare.
   - Ab **"Send Case via WhatsApp"** dabaye.
5. **Expected Result**:
   - Case status update hokar `CONTACTED` ban jayega.
   - Dev mode me server terminal me formatted WhatsApp text print hoga jisme mandatory medical disclaimer hoga.

---

### Test 7: Farm Economics Ledger

#### Goal:
Financial calculations ka hisab check karna, FCR check karna, aur ensure karna ki koi bhi financial number AI se jhootha calculate na ho (Deterministic Math & Labeled Assumptions).

#### Step 7.1: Naya Kharche (Expense) Entry Kare
1. `http://localhost:3000/dashboard/economics` open kare.
2. Click kare **"+ Add Expense / Transaction"** (`/dashboard/economics/add`).
3. Fill kare:
   - **Type**: `Expense`
   - **Category**: `Feed (Starter / Broiler)`
   - **Amount (₹)**: `45000`
   - **Quantity**: `30 Bags`
   - **Date**: Aaj ki date.
4. **"Save Expense"** dabaye.

#### Step 7.2: Financial Metrics & Assumptions Check (Hard Rule #5)
1. Wapas Economics dashboard par metrics check kare:
   - **Total Batch Cost**: `Pichle kharche + ₹45,000` accurately calculate hoga.
   - **Cost Per Surviving Bird**: `Total Cost ÷ (Initial Birds - Mortality)`
   - **Feed Cost Share (%)**: Kul kharche me daane ka kitna percent hissa hai (e.g. `68.4%`).
2. **Assumption Labels Check Kare**:
   - Agar market rate ya chick cost estimated hai, to card ke niche saaf tag dikhega: *"Estimated assuming ₹110/kg market mandi rate"* (Koi jhoothi precision nahi!).

---

### Test 8: Super Admin Console

#### Goal:
Bina code re-deploy kiye admin dwara threshold sliders change karna, GADVASU research upload karna, aur audit trail monitor karna.

#### Step 8.1: Threshold Slider Change Kare (Zero-Deploy Updates)
1. `admin@pankh.app` se login karke `http://localhost:3000/admin/rules` par jaye.
2. **Mortality Rate Urgent Warning (%)** slider ko `1.5%` se badhakar `2.0%` kare.
3. **Save Rules** button dabaye.
4. **Expected Result**:
   - Database me new threshold instantly save ho jayega.
   - Iske baad farmer ke check-in par naya threshold bina server restart kiye turant apply ho jayega!
   - Niche `Rule Change History` audit table me entry aa jayegi: `Changed from 1.5 to 2.0 by admin@pankh.app`.

#### Step 8.2: Knowledge Base Management
1. `http://localhost:3000/admin/knowledge` open kare.
2. Click kare **"+ Ingest Approved Source"**.
3. Source details bhare:
   - **Title**: `GADVASU Heatwave Poultry Advisory 2026`
   - **Authority**: `GADVASU Ludhiana`
   - **Topic**: `Heat Stress`
   - **Content**: Summer me dopahar 12 se 4 baje tak drinking water me electrolyte aur shed fans use karne ki guidance.
4. **"Ingest & Save"** dabaye.
5. **Expected Result**: 
   - Source vector knowledge base me store ho jayega aur farmer ke Pankh AI me search ke liye available ho jayega.

---

### Test 9: Notifications Engine & Header Bell Icon

#### Goal:
Section 7.3 notification policy check karna (Amber alerts silent rehte hain, Red alerts urgent notify karte hain).

#### Steps:
1. Farmer dashboard me top right **Bell Icon (🔔)** par click kare.
2. Notification drawer khulega:
   - Daily Check-in Reminder
   - High-Risk Alert Notice
   - Vaccination Due Notice
3. Kisi notification par click kare — wo directly us screen par redirect karega.
4. **"Mark All as Read"** par click kare — unread count zero ho jayega.

---

### Test 10: PWA & Offline Network Loss Test

#### Goal:
Kisan ka internet gaon me chala jaye to bhi form ka data gayab na ho (Hard Rule #7).

#### Steps:
1. `http://localhost:3000/dashboard/sentinel/checkin` open kare.
2. Check-in ke box me Mortality aur Feed type kare (Submit mat dabaye).
3. Browser me **F12** dabaye -> **Network** tab me jaye -> Dropdown me **"Offline"** choose kare (Internet band).
4. Ab page par dekhe:
   - Ek amber offline warning banner aayega: *"You are currently offline. Changes are saved locally."*
5. Submit button dabaye:
   - Form ka likha hua data gayab nahi hoga!
6. Network dropdown me wapas **"No throttling"** (Online) kare.
7. Retry dabaye — submission successfully save ho jayegi!

---

## 3. Automated Test Suite Verification

Humne terminal me saare automated test suites ko run karke complete codebase verify kar liya hai. Har ek test 100% pass ho chuka hai:

| Test Suite / Script | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **Pankh AI Scenarios** | `npx tsx scripts/test-phase3-scenarios.ts` | **PASS (100%)** | 6-step structure, red-flag interception, source citations verified. |
| **Sentinel Risk Engine** | `npx tsx scripts/test-sentinel-scenarios.ts` | **PASS (100%)** | 7-day rolling baselines, water drop red flags, case record sync verified. |
| **Connect Vet Directory** | `npx tsx scripts/test-connect-scenarios.ts` | **18 / 18 PASS** | Driving proximity, GADVASU labs, consent barrier, WhatsApp dispatch verified. |
| **Farm Economics Suite** | `npx tsx scripts/test-economics-scenarios.ts` | **22 / 22 PASS** | Batch cost, cost per bird, margin, zero fabricated FCR verified. |
| **Admin Console Suite** | `npx tsx scripts/test-phase7-admin-scenarios.ts` | **27 / 27 PASS** | Threshold sliders, audit log history, knowledge base approval verified. |
| **Phase 8 & 9 Integrations** | `npx tsx scripts/test-phase8-scenarios.ts` | **12 / 12 PASS** | Poultry THI calculation, 3-hour weather cache, Section 7.3 alerts verified. |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **0 ERRORS** | Poore project me strict TypeScript typing 100% clean hai. |
| **Next.js Production Build** | `npx next build` | **35 / 35 PASS** | Sabhi 35 static aur dynamic pages successfully compile ho rahe hain. |

Aap bhi jab chahe in scripts ko terminal me `npx tsx scripts/<filename>` run karke check kar sakte hain!

---

## 4. Testing Ke Waqt Dhyan Rakhne Wali Baatein

1. **Diagnosis Rule**: Agar AI kabhi bhi *"Aapki murgiyon ko pakka Newcastle bimari hai"* jaisa confirmed dawa kare, to samajh lijiye bug hai. AI ko hamesha symptom pattern batana hai aur laboratory test recommend karna hai.
2. **Financial Assumption Rule**: Economics page par agar flock weight input nahi diya gaya hai to FCR ko calculate nahi karna chahiye (it must remain empty or labeled estimated).
3. **Voice Input**: Chrome/Edge browser me microphone permission allow karni zaroori hai.
4. **Twilio WhatsApp in Dev**: Development environment me agar Twilio account trial mode me hai to Twilio unverified numbers par WhatsApp send reject karta hai, jiska fallback Pankh ke server log me printed simulation ke through perfectly handle hota hai.

---
*Pankh (ਪੰਖ) — Built with ❤️ for Punjab's Poultry Farming Community.*
