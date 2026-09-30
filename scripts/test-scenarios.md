# Pankh — Definition of Done (DoD) Test Scenarios Matrix

This test matrix evaluates each of the Definition of Done criteria outlined in the build specification.

---

## 1. Onboarding Flow Under 3 Minutes
- **Scenario**: A new poultry farmer signs up and completes onboarding.
- **Steps**:
  1. Register at `/register` with phone `9876543210`, name, and password.
  2. Complete Farm Profile: Shed Count, Farm Type (Tunnel/Open), Capacity (3,000 birds), District (Ludhiana), Coordinates GPS pin.
  3. Enter Active Batch details: Breed (Cobb 500), Bird Type (Broiler), Placement Date, Bird Count.
- **Verification**: Form draft restores if page reloads; completes in under 3 minutes; redirects to `/dashboard` with flock context ready.

---

## 2. Pankh AI Symptom Evaluation & 6-Step Answer Structure
- **Scenario**: Farmer submits a query: *"Mere chooje sust hain aur feed kam kha rahe hain"* (Birds are dull and eating less feed).
- **Steps**:
  1. Open `/dashboard/ask`. Submit query via text or voice.
- **Verification**:
  - Response adheres strictly to the 6-step architecture:
    1. **Answer** (Direct, concise summary)
    2. **Why** (1-3 biological bullets)
    3. **What to do now** (Actionable steps)
    4. **Ask** (Follow-up clarification questions)
    5. **Escalate** (Triage recommendation)
    6. **Source** (*"Based on: ICAR Poultry Health Handbook"*)
  - Hard Rule #1: The AI **NEVER** claims a confirmed diagnosis.
  - Hard Rule #4: Source citation is retrieved from actual vector embeddings.

---

## 3. Red-Flag Symptom Layer & Vet Escalation (Hard Rule #1 & #3)
- **Scenario**: Farmer reports emergency: *"Subah se 40 chooje mar gaye hain aur gardan mud rahi hai"* (40 dead birds, twisted neck / torticollis).
- **Steps**:
  1. Submit in Ask-AI or Daily Check-in.
- **Verification**:
  - Deterministic safety rule intercepts BEFORE LLM generation.
  - Flags Urgent RED status immediately without claiming Newcastle/Ranikhet diagnosis.
  - Triggers urgent 1-tap "Connect with Nearby Vet" button.
  - Dispatches automated Twilio WhatsApp message with case summary.

---

## 4. Sentinel 60-Second Check-in & Rolling Baseline Deviation
- **Scenario**: Farmer logs daily feed (130 kg), water (260 L), mortality (2 birds), and shed temp (31.5°C).
- **Steps**:
  1. Open `/dashboard/sentinel/checkin`.
  2. Outside weather context is clearly displayed (e.g. 34°C, 48% RH, THI 76).
  3. Submit check-in.
- **Verification**:
  - Risk engine compares inputs against 7-day median baseline.
  - Stores `DailyHealthLog` and updates `currentBirds` in active flock.
  - Generates `GREEN` alert when metrics are within normal baseline range.

---

## 5. Pankh Connect Geospatial Vet Directory & Informed Consent (Hard Rule #6)
- **Scenario**: Farmer seeks professional veterinary assistance for flock distress.
- **Steps**:
  1. Open `/dashboard/connect`.
  2. View verified directory: Dr. Harpreet Singh (GADVASU Ludhiana, 8.4 km away).
  3. Click "Share Case Summary via WhatsApp".
- **Verification**:
  - Modal requests explicit farmer authorization before sending personal phone, flock size, and 7-day trend data.
  - Once authorized, case status updates to `CONTACTED`.
  - Notification sent to farmer confirming dispatch.

---

## 6. Farm Economics Ledger & Labeled Financial Assumptions (Hard Rule #5)
- **Scenario**: Farmer records a ₹12,500 feed expense (5 bags @ ₹2,500/bag).
- **Steps**:
  1. Open `/dashboard/economics/add`.
  2. Enter Category: FEED, Amount: 12500, Qty: 5 Bags. Submit.
- **Verification**:
  - Cost per surviving bird updates dynamically.
  - If flock weight or harvest revenue is estimated, explicit labels are attached (*"Estimated", "Assuming ₹110/kg market rate"*).
  - Break-even visualizer updates live margin.

---

## 7. Form Offline Network Failure Resilience (Hard Rule #7)
- **Scenario**: Network drops while farmer is filling Check-in or Economics entry.
- **Steps**:
  1. Open `/dashboard/sentinel/checkin` or `/dashboard/economics/add`.
  2. Fill form inputs.
  3. Disable network in browser DevTools (Offline mode).
  4. Tap "Submit Check-in".
- **Verification**:
  - Form does **NOT** wipe entered inputs.
  - Floating `<OfflineBanner />` alerts farmer of offline mode.
  - Error banner displays *"Network / Submission Error: Your draft remains saved locally"* with an instant **"Retry Submission"** button.
  - Upon reconnecting, tapping Retry submits successfully.

---

## 8. Admin Dynamic Governance Without Code Deploy
- **Scenario**: Super Admin adjusts mortality alert threshold or updates veterinary directory.
- **Steps**:
  1. Log into `/admin` with `admin@pankh.app`.
  2. Open `/admin/rules` $\to$ change `MORTALITY_RATE_WARNING` from 0.5% to 0.6%.
  3. Save rule.
- **Verification**:
  - Alert rule updates in PostgreSQL immediately without requiring code deployment or server restart.
  - Subsequent check-ins evaluate against the new live threshold.

---

## 9. Full Health Traceability Audit
- **Scenario**: Auditor verifies safety decision path for a health query.
- **Steps**:
  1. Check `AuditLog` table for `SENTINEL_RED_ALERT_ESCALATION` and `AI_QUERY_EVALUATION`.
- **Verification**:
  - Records input query $\to$ deterministic rule decision $\to$ retrieved chunk IDs $\to$ LLM output $\to$ escalation status.
