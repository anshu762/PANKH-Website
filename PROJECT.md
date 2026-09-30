# 🌾 PANKH (ਪੰਖ / पंख) — Complete Project Blueprint & Vision

> **"ਪੰਖ (Pankh)" ka seedha matlab hai: Par (Feathers / Flight).**  
> Yeh ek **Rural-First, Punjabi-Native Poultry Farm Intelligence & Early Disease Surveillance Platform** hai.  
> Asaan bhasha mein: **"Murghi-Palan (Poultry Farming) karne wale kissano ke liye AI Doctor, Early Warning Alarm, Doctor Escalation aur Munafa-Hisaab (Economics) ka ek complete digital saathi."**

---

## 📌 1. Ye Project Kyun Bana? (The Ground Reality & Problem)

Punjab aur North India (Ludhiana, Hoshiarpur, Sangrur, Patiala, Karnal, etc.) mein poultry farming (Broiler - meat ke liye, Layer - ando ke liye) lakho kissano ka rozgaar hai. 

Lekin is business mein ek bohot bada khatra hota hai: **"Achanak Bimari Phailna (Flock Disease Outbreak) aur Garmi ka Stress (Heatwave Mortality)."**

### Zameen par kisan ki aam musibatein:
1. **48 Ghante Mein Sab Barbaad**: Ranikhet (Newcastle Disease), Gumboro (IBD), ya Coccidiosis jaisi bimari aane par agar 24-48 ghante mein action na liya jaye, toh pura ka pura shed (1,000 se 5,000 murghiyan) mar jati hai. Kissan ka lakho rupaye ka nuksaan ho jata hai.
2. **Koyi Early Warning System Nahi Tha**: Kissan tab tak shant rehte hain jab tak murghiyan marna shuru nahi hoti. Jab 40-50 murghiyan mar jati hain, tab pata chalta hai ki bimari 5 din pehle hi shuru ho chuki thi (paani/daana pehle hi kam ho chuka tha).
3. **Nakli Doctor aur Galat Dawai**: Kissan ghabra kar local dawai dukandar ya unauthorized logon se mehengi antibiotics khareed kar daal dete hain, jisse flock aur kharab ho jata hai aur kharcha badh jata hai.
4. **English SaaS Apps Kisan Ke Kaam Ki Nahi**: Market mein jo poultry software hain wo badi corporate companies ke liye English desktop dashboards hain. Desi kisan ko Punjabi ya bol-chal wali Hindi/Hinglish chahiye, jo dhoop mein mobile par chal sake, aur bol kar (Voice) sawal pooch sake.
5. **Kaccha Hisab-Kitab**: Kisan dairy/copy par kharcha likhte hain. Unhe aakhri din tak nahi pata chalta ki per-bird cost kya aayi, FCR (Feed Conversion Ratio) kitna hai, aur mandi rate par bechne par faayda hoga ya nuksaan.

---

## 🎯 2. Hum Log Kya Bana Rahe Hain? (The Solution)

Pankh koi generic chatbot ya fancy SaaS nahi hai. **Yeh kisan ke hath mein ek 4-Pillar Digital Sheild (Suraksha Chakra) hai:**

```
                                ┌─────────────────────────────────────────┐
                                │          PANKH POULTRY PLATFORM         │
                                └────────────────────┬────────────────────┘
                                                     │
         ┌───────────────────┬───────────────────────┴───────────────────────┬───────────────────┐
         ▼                   ▼                                               ▼                   ▼
┌─────────────────┐ ┌─────────────────────────┐                     ┌─────────────────┐ ┌─────────────────┐
│   1. PANKH AI   │ │    2. PANKH SENTINEL    │                     │ 3. PANKH CONNECT│ │ 4. PANKH ECON   │
│  (Sawal-Jawab)  │ │ (Early Risk Surveillance│                     │  (Vet Telemed)  │ │ (Kharcha/Faida) │
│  Voice/Punjabi  │ │  & Weather Heat Stress) │                     │  1-Tap WhatsApp │ │ Real FCR & Cost │
└─────────────────┘ └─────────────────────────┘                     └─────────────────┘ └─────────────────┘
```

---

## 🧩 3. The 4 Core Modules (Detail Mein)

### Module 1: Pankh AI (ਪੰਖ ਸਹਾਇਕ — Smart Poultry Advisor)
* **Kiske liye hai?**: Kisan ke rozana ke sawalon ke liye (bimari ke lakshan, daana-pani, teekakaran, shed management).
* **Kaise kaam karta hai?**:
  - Kisan **Punjabi ya Hindi mein bol kar (Voice Mic)** ya type karke sawal pooch sakta hai (jaise: *"ਮੇਰੇ ਚੂਚਿਆਂ ਨੂੰ ਪਤਲੀ ਵਿੱਠ ਆ ਰਹੀ ਹੈ"* ya *"Garmi mein shed ka temperature kaise control karein?"*).
  - **Strict Medical Rule**: AI kabhi bhi khud ko veterinary doctor claim **nahi** karega aur na hi kisi bimari ka pakka diagnosis bolega. Yeh kisan ko lakshan batayega, risk samjhayega aur sahi kadam batayega.
  - **6-Step Format**: Har jawab 6 hisson mein aayega — *Answer → Kyun hua (Why) → Abhi kya karein (What to do) → Agla sawal (Ask) → Doctor ko dikhayein ya nahi (Escalate) → Kahan se padha (Approved Source: PAU / GADVASU / ICAR)*.
  - **Ultra-Cost Effective**: Google Gemini 2.0 Flash use karta hai jisse API bill na ke barabar aata hai aur speed sub-second hoti hai.

---

### Module 2: Pankh Sentinel (ਰੋਗ ਨਿਗਰਾਨੀ — Early Warning Radar)
* **Kiske liye hai?**: Rozana ka 45-second health check-in, jo bimari aane se 3 din pehle alert de deta hai.
* **Kaise kaam karta hai?**:
  - Kisan roz subah ya sham ko sirf 4 cheezein dalta hai: **Mortality (aaj kitni mari), Daana (Feed kg), Paani (Water litres), aur Shed ka Temperature**.
  - **Rolling 7-Day Baseline**: System pichle 7 din ke average se compare karta hai. Agar daana 15% kam hua ya paani 20% gira, toh murghi marne se pehle hi **AMBER** ya **RED ALERT** baj jata hai!
  - **Live Weather & Heat-Stress Index (THI)**: OpenWeatherMap se bahar ki dhoop aur nami (humidity) dekh kar poultry heat-stress calculate karta hai aur kisan ko batata hai ki foggers aur pankhe kab chalane hain.

---

### Module 3: Pankh Connect (ਡਾਕਟਰੀ ਸੰਪਰਕ — Verified Vet & Lab Network)
* **Kiske liye hai?**: Jab Sentinel par RED alert aaye ya kisan ko doctor ki zaroorat ho.
* **Kaise kaam karta hai?**:
  - Samrala, Ludhiana, aur Punjab bhar ke verified poultry doctors, GADVASU diagnostic labs, aur dawa dukano ki list driving distance (km) ke sath dikhata hai.
  - **1-Tap WhatsApp Case Escalation**: Kisan ki permission (Consent) lekar ek single-click WhatsApp summary banti hai jisme flock ki umar, aaj ki mortality, aur lakshan seedhe doctor ke phone par chale jate hain. Doctor bina samay gavaye sahi clinical salah de sakta hai.

---

### Module 4: Pankh Farm Economics (ਖ਼ਰਚਾ ਤੇ ਮੁਨਾਫ਼ਾ — Real Profit/Loss Tracker)
* **Kiske liye hai?**: Kisan ko uski asli lagat aur munafa batane ke liye.
* **Kaise kaam karta hai?**:
  - Daana, chuzey (chicks), dawai, bijli, labour ka roz ka kharcha record karta hai.
  - **Deterministic Math (100% Sahi Hisab)**: AI ko numbers calculate nahi karne diya jata — pure formula engine FCR (Feed Conversion Ratio), Cost Per Bird, Feed Share %, aur Mandi Break-Even Price calculate karta hai.
  - **Transparent Assumptions (Hard Rule #5)**: Agar kisan ne selling price nahi daali, toh system saaf likhega: *"Assuming ₹95/kg (estimated Ludhiana mandi benchmark)"* — koyi jhoothi precision nahi.

---

### Bonus Module: Super Admin & University Governance Console (`/admin`)
* **Kiske liye hai?**: GADVASU ke poultry professors, Animal Husbandry Department ke officers, aur system admins ke liye.
* **Kya karta hai?**:
  - Pura Punjab map par surveillance telemetry (kis district mein kitne RED alert aaye, viral outbreak toh nahi ho raha).
  - Alert sensitivity thresholds ko slider se bina code badle adjust karna.
  - Verified research documents upload karna jo AI RAG mein auto-ingest ho jate hain.

---

## 👥 4. Kiske Liye Bana Hai? (User Personas)

| User Persona | Profile | Wo Pankh Se Kya Hasil Karta Hai? |
| :--- | :--- | :--- |
| **Gurpreet Singh** *(Smallholder Farmer)* | Samrala, Ludhiana mein 1,500 Broiler flock chalata hai. Punjabi bolta hai. Phone par voice note use karta hai. | Subah 40 second mein check-in karta hai. Garmi mein heatwave alert milta hai. Bimari aane par WhatsApp se Dr. Harpreet ko case bhejta hai. |
| **Balwinder Kaur** *(Layer Farm Owner)* | Hoshiarpur mein 4,000 Layer murghiyan (ando ke liye). FCR aur feed cost track karna chahti hai. | Economics module se dekhti hai ki per-egg cost kitni aayi aur kahan daane ki barbadi ho rahi hai. |
| **Dr. Harpreet Singh** *(Poultry Vet / GADVASU)* | Ludhiana district polyclinic mein veterinary doctor. Roz 30 phone call aate hain. | Kisan se lambi behas ki jagah Pankh ka standard WhatsApp dossier dekhta hai aur 2 minute mein sahi dawai prescribe karta hai. |
| **State Animal Husbandry Officer** | Punjab government animal health wing. | District level heatmaps dekh kar pata lagata hai ki kis tehsil mein Avian Influenza ya Ranikhet phail raha hai. |

---

## 🚜 5. Desi Grounding & Design Theme (Kyun Alag Lagta Hai?)

Pankh ko dekh kar lagna chahiye ki **yeh Punjab ki mitti aur murghi-shed ke liye bana hai**, na ki California ke kisi AC office ke liye:

* **Pankh Chuna (`#FBFBF9`)**: Shed ki chune wali safedi (fresh lime-washed walls).
* **Pankh Clay (`#18181B`)**: Punjab ke khet ki kali-gehri mitti.
* **Pankh Marigold (`#D97706`)**: Sarson ke phool aur brooder lamp ki peeli dhoop.
* **Gurmukhi + Hinglish First**: Har button aur headline mein Gurmukhi (`ਪੰਜਾਬੀ`) aur Hinglish ka aadar hai.
* **PWA & Offline Resilience**: Khet mein 4G/5G internet chala bhi jaye, toh form ka data gayab nahi hota; draft phone mein save rehta hai aur reconnect hone par sync hota hai.

---

## 🚀 6. Tech Stack & External Tools Summary

1. **Next.js 14 App Router + TypeScript**: Fast, scalable, server-rendered frontend & backend.
2. **Neon PostgreSQL + pgvector**: Cloud database with vector search for medical retrieval.
3. **Google Gemini 2.0 Flash**: High-speed, multilingual Punjabi/Hindi intelligence at ₹0 free-tier / minimal token cost.
4. **Google Cloud STT/TTS**: Punjabi voice speech recognition and audio readout.
5. **OpenWeatherMap**: Real-time ambient weather & temperature-humidity index (THI).
6. **Twilio WhatsApp/SMS**: Automated Section 7.3 emergency alerts to farmer phones.
7. **PWA (Progressive Web App)**: Installable on Android/iOS like a native app with offline caching.

---

## 💡 7. Ek Line Mein Summary

> **"Pankh ek aisa platform hai jo Punjab ke har chote-bade poultry kisan ko ek jeb mein rehne wala AI doctor, early disease alarm, specialist vet connection, aur hisab-kitab ka munshi deta hai — taaki kisan ka ek bhi flock be-wajah na mare aur uski mehnat ka pura daam mile."**
