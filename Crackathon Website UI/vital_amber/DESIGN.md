```markdown
# Design System Document: The Empathetic Urgency Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Sanctuary"**

This design system rejects the cold, sterile, and anxiety-inducing aesthetics of traditional medical software. Instead, it adopts a high-end editorial approach that balances **maternal warmth** with **decisive urgency**. 

We achieve this through "The Clinical Sanctuary" philosophy: layouts must feel as safe as a home but as organized as a premium clinic. By leveraging intentional asymmetry, oversized typography, and a "borderless" interface, we remove the cognitive noise of traditional grids, allowing critical medical information to breathe. The goal is to guide the user’s eye with soft tonal shifts rather than harsh structural lines, creating a sense of calm authority during urgent moments.

---

## 2. Colors & Surface Architecture

### The Palette
The color strategy uses a base of **Warm Off-White (#fdf9e9)** to reduce eye strain and provide a "paper-like" tactile quality.
- **Primary (The Anchor):** `primary (#855300)` and `primary_container (#f59e0b)`. Used for high-level brand moments and stable navigation.
- **Secondary/Tertiary (The Signal):** `secondary (#9d4300)` and `tertiary (#a93349)`. These are our "Urgency" colors. Use these for alerts, vitals, and critical calls to action.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning. 
Structure is defined through background shifts. A `surface_container_low` card sitting on a `surface` background creates a natural boundary. If you feel the need to draw a line, instead increase the padding (using the Spacing Scale) or shift the background token.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical, rounded layers.
- **Base Layer:** `surface` (#fdf9e9)
- **Secondary Layer:** `surface_container` (#f2eede)
- **High-Priority Layer:** `surface_container_high` (#ece8d9)

### The "Glass & Gradient" Rule
To elevate the experience from "app" to "experience," use a **Signature Texture**: 
- **Urgent CTAs:** Use a subtle linear gradient from `secondary` to `secondary_container` at a 135° angle.
- **Floating Modals:** Use `surface_container_lowest` with a 12px `backdrop-blur` and 85% opacity to allow the warm background colors to bleed through, softening the interface.

---

## 3. Typography
We utilize **Lexend** for its hyper-readability and friendly, rounded terminals, paired with **Plus Jakarta Sans** for utility labels to maintain a professional, "clinical" edge.

- **Display (Display-LG/MD):** Used for critical status updates (e.g., "Arriving in 5 mins"). Use tight letter-spacing (-0.02em) to maintain a serious tone.
- **Headlines (Headline-LG):** Your primary editorial voice. Use these to speak directly to the user in a caring tone ("How are you feeling, Sarah?").
- **Body (Body-LG):** Set in Lexend for maximum legibility during high-stress moments.
- **Labels (Label-MD):** Set in Plus Jakarta Sans. These are for data points—heart rate, timestamps, and dosages—where precision is paramount.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved via **Tonal Layering**. To highlight a medical record, do not use a shadow; place a `surface_container_lowest` (#ffffff) card on a `surface_dim` (#dedacb) background. This creates a "lift" that feels organic and light.

### Ambient Shadows
When an element must float (e.g., an emergency FAB or a critical alert popover), use an **Ambient Shadow**:
- **X: 0, Y: 8, Blur: 32, Spread: 0**
- **Color:** Use `on_surface` at **6% opacity**. 
Never use pure black or grey shadows; the shadow must be a tinted version of the background to maintain the "Warm Off-White" atmosphere.

### The "Ghost Border" Fallback
If a border is legally or accessibly required (e.g., input fields), use the **Ghost Border**: `outline_variant` at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary (Urgent):** High-roundness (`xl: 3rem`), background: `secondary` gradient, text: `on_secondary`.
- **Secondary (Caring):** Background: `primary_container`, text: `on_primary_container`.
- **States:** On hover, increase the `surface_tint` overlay by 8%. On press, scale down to 0.98 for tactile feedback.

### Cards & Lists
**Strict Rule:** No dividers. 
Separate list items using `8 (2rem)` vertical spacing or by alternating backgrounds between `surface` and `surface_container_low`. 
- **Card Roundness:** Always use `xl` (3rem) for parent containers and `lg` (2rem) for nested child elements.

### Input Fields
- **Style:** Filled, not outlined. Use `surface_container_highest`.
- **Active State:** The bottom indicator should be `primary` at 2px thickness. 
- **Error State:** Use `error` (#ba1a1a) for the label text and a `surface_container_highest` background with an `error` ghost border (20% opacity).

### Signature Component: The "Vitality Pulse"
A custom chip for medical vitals. It uses a `tertiary_container` background with `tertiary` text. It features a soft, 4px pulse animation (using a semi-transparent `tertiary` shadow) to indicate live data.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical layouts. Place a headline on the left and the CTA on the right with a 64px offset to create an editorial, high-end feel.
- **Do** use the full range of the Spacing Scale. If an interface feels "urgent," increase the white space—not the font size—to keep the user calm.
- **Do** use `ROUND_TWELVE` (3rem) for all major containers to reinforce the "Friendly/Caring" tone.

### Don't
- **Don't** use 100% black (#000000) for text. Always use `on_surface` (#1c1c13) to keep the contrast "soft-serious."
- **Don't** use sharp corners. Sharpness triggers a "danger" response in the brain; our "Urgency" comes from color and type scale, not sharp edges.
- **Don't** stack more than three layers of surfaces. If you need a fourth level of hierarchy, use a `Glassmorphism` blur.

---

**Director's Final Note:** This system is a conversation between the provider and the patient. Every pixel should feel like a steady hand on a shoulder—urgent, yes, but profoundly composed.```