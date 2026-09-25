# PANKH — Design System & Brand Direction

## 1. Brand Philosophy & Agrarian Grounding
Pankh (ਪੰਖ / पंख — *feather / flight*) is a poultry farm intelligence and disease surveillance platform designed specifically for commercial and backyard poultry farmers across Punjab and North India.

Its visual identity must never feel like an American Silicon Valley SaaS template or a generic AI chatbot. Every visual decision is directly grounded in the physical realities of Punjab agriculture and poultry husbandry:

- **The Land & Sheds**: Sun-warmed mustard fields (*sarson ke khet*), fertile canal-irrigated alluvial soil (*mitti*), clean lime-washed shed walls (*chuna*), galvanized feed troughs, and glowing infrared brooder lamps warming day-old chicks.
- **The People**: Hardworking farm owners and shed managers operating in bright outdoor sunlight, reading screens with dusty hands, communicating across Punjabi, Hindi, and conversational Hinglish.
- **The Craft**: Traditional Phulkari geometric embroidery motifs, honest hand-turned metalwork, and clean typography that honors Gurmukhi and Latin scripts equally.

---

## 2. Color Palette & Subject-Matter Tokens

| Token Name | Hex Code | Agrarian / Subject-Matter Source | Application |
| :--- | :--- | :--- | :--- |
| **Pankh Chuna (Base Paper)** | `#FBFBF9` | Fresh lime-washed poultry shed walls (*chuna safedi*) | Primary page background |
| **Pankh Clay (Dark Earth)** | `#18181B` | Fertile alluvial soil of the Punjab plains | Primary high-contrast text, dark surfaces |
| **Pankh Marigold (Sarson Gold)**| `#D97706` / `#F59E0B`| Blooming yellow mustard flowers & infrared brooder glow | Pankh AI assistant, primary action warmth |
| **Sentinel Emerald (Normal)** | `#059669` | Thriving flock livability, healthy crop greens | Normal risk status, positive batch profits |
| **Sentinel Amber (Watch)** | `#D97706` | Warning brooder drop, suspicious feed intake drop | Watch alert, moderate risk warning |
| **Sentinel Crimson (Urgent)** | `#DC2626` | Emergency disease spike, sudden flock mortality | Red alert, immediate vet escalation required |
| **Phulkari Vermilion** | `#EA580C` | Traditional Punjab Phulkari silk-thread embroidery | Pankh Connect vet & lab referral badges |
| **Night Indigo** | `#1E1B4B` | Late-night shed check, ledger books, and calm night skies | Pankh Farm Economics, financial ledgers |
| **Canal Blue** | `#0284C7` | Punjab canal water system (*nahari paani*), biosecurity sanitation | Water medication logs, testing lab tags |

---

## 3. Typography Hierarchy

### Primary Editorial Serif: `Fraunces`
- **Role**: Headlines, section titles, and key agricultural statements.
- **Characteristics**: Warm, authoritative, editorial serif that reflects agrarian literature, human craft, and grounded trust rather than cold geometric tech.

### Technical & UI Sans: `Manrope`
- **Role**: Body text, numbers, FCR statistics, mortality counts, buttons, and form inputs.
- **Characteristics**: Highly legible modern geometric sans with open apertures and clean tabular figures for rapid comprehension in sunlight.

### Native Gurmukhi Script: `Noto Sans Gurmukhi`
- **Role**: Punjabi native script rendering.
- **Characteristics**: Authentic, balanced Gurmukhi letterforms ensuring complete legibility for native Punjabi readers across all screen sizes.

---

## 4. Anti-Patterns & Visual Rules (Strictly Enforced)

1. **NO Generic SaaS Card Kits**:
   Never render four identical rounded cards with the same faint grey shadow. Each of Pankh's four modules must have its own distinct visual treatment (Marigold warm border for AI, Tri-color status monitor for Sentinel, Phulkari vermilion stitch for Connect, and Night-indigo slate for Economics).

2. **NO ALL-CAPS Eyebrow Labels**:
   Avoid generic labels like `FEATURES`, `HOW IT WORKS`, or `TESTIMONIALS` in tiny uppercase letters with wide letter-spacing. Use natural sentence-case phrasing or culturally grounded badges.

3. **NO Single-Word Colored Gradient Highlights**:
   Do not apply rainbow or generic violet gradients to a single arbitrary word in a headline (e.g. *Empowering* in purple). Let bold editorial typography speak for itself.

4. **NO Arbitrary Arrow Clichés**:
   Do not append `→` arrows to every single button. Use purposeful labels ("Free me shuru karo", "Dekhein kaise kaam karta hai").

5. **NO Literal Bullet Characters**:
   Never use raw `•` characters in JSX copy. Use semantic `<ul>` and `<li>` markup with accessible icon markers.

6. **Farmer Accessibility First**:
   - Minimum tap target height: **48px** for touch elements.
   - High contrast ratio (WCAG AAA compliant on primary body text).
   - Motion is purposeful and respects `prefers-reduced-motion`.
