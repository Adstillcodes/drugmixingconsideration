# Project Context: MediSafe - Drug Interaction Analyzer

## Overview

This document summarizes the development of **MediSafe**, a prescription drug interaction analyzer built for the Randomize Hackathon. The project converts a Figma-style UI design into a fully functional React web application with drug interaction checking capabilities.

---

## Project Goal

Build a web application that:
1. Takes user input (gender, pregnancy status, medications, conditions)
2. Accepts prescription uploads (PDF/JPG) with OCR
3. Analyzes drug-drug interactions using RxLabelGuard API
4. Generates color-coded risk reports with AI insights (WebLLM)
5. Provides accessible UI for users of all ages

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + Vite | UI framework |
| Styling | Tailwind CSS v4 | Design system |
| OCR | Tesseract.js | Prescription text extraction |
| Drug API | RxLabelGuard | FDA drug interaction data |
| AI | Groq AI
| Icons | Material Symbols | Iconography |

---

## Key Features Implemented

### 1. Multi-Step Intake Form
- Prescription type selection (Self-prescribed / Active prescription)
- Demographics (Gender, Age)
- Pregnancy/Lactation check (for female users)
- Medication search with autocomplete
- Pre-existing conditions selection
- Optional prescription upload

### 2. Drug Interaction Analysis
- RxLabelGuard API integration with mock data fallback
- Risk scoring algorithm (Critical → High → Moderate → Low → Safe)
- Color-coded severity badges
- Personalized recommendations based on user context

### 3. AI-Powered Insights
- WebLLM integration for local AI analysis
- Contextual warnings for pregnancy/lactation
- Personalized safety recommendations
- Plain-language explanations

### 4. Results Dashboard
- Interactive risk gauge visualization
- Medication list display
- AI analysis summary
- Expandable interaction cards
- Detailed deep-dive view

### 5. Recommendations Screen
- Severity-based action plans
- Urgent/Non-urgent prioritization
- Shareable reports
- Professional consultation CTAs

---

## Design System

Based on the original UI ("Clinical Sanctuary" theme):
- **Colors:** Coral (#E76F51), Saffron (#F4A261), Warm off-white backgrounds
- **Typography:** Lexend font family
- **Components:** Rounded cards, subtle shadows, glass effects
- **Accessibility:** Large fonts, high contrast, screen reader support

---

## File Structure

```
medi-safe/
├── src/
│   ├── components/
│   │   ├── TopNav.jsx          # Top navigation bar
│   │   ├── SideNav.jsx         # Sidebar navigation
│   │   ├── BottomNav.jsx       # Mobile bottom nav
│   │   ├── IntakeForm.jsx      # Main intake form
│   │   ├── ProcessingScreen.jsx # Loading animation
│   │   ├── ResultsDashboard.jsx # Results display
│   │   ├── InteractionDeepDive.jsx # Detailed view
│   │   └── Recommendations.jsx # Guidance & next steps
│   ├── context/
│   │   └── AppContext.jsx      # State management
│   ├── services/
│   │   ├── ocr.js              # Tesseract.js OCR
│   │   ├── rxlabelguard.js     # API integration
│   │   └── webllm.js           # WebLLM integration
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
└── FEASIBILITY_ANALYSIS.md
```

---

## API Integration

### RxLabelGuard
- **Endpoint:** POST /v1/interactions/check
- **Scopes Required:** `interactions:check`, `interactions:ask`
- **Free Tier:** 50 requests/month
- **Data Source:** FDA Structured Product Labeling

### Environment Variables
```
VITE_RXLABELGUARD_API_KEY=your_api_key_here
```

---

## Key Decisions Made

1. **No Backend Required** - All processing client-side
2. **Privacy-First** - No user data stored
3. **WebLLM for AI** - Browser-based, no server needed
4. **Mock Data Fallback** - Works without API key for demo
5. **Accessibility Priority** - UI designed for all age groups

---

## Current Status

| Feature | Status |
|---------|--------|
| UI Conversion | ✅ Complete |
| Intake Form | ✅ Complete |
| Drug Search | ✅ Complete |
| API Integration | ✅ Complete |
| Risk Assessment | ✅ Complete |
| Results Display | ✅ Complete |
| AI Analysis | ✅ Complete (fallback mode) |
| OCR | ⚙️ Basic implementation |

---

## Running the Project

```bash
cd medi-safe
npm install
npm run dev
```

---

## For Presentation

- **Problem:** Drug interactions are a public health risk, especially for self-medicating users
- **Solution:** Accessible, privacy-first drug interaction analyzer
- **Differentiation:** Beautiful UI, no signup required, runs locally
- **Cost:** $0 for MVP (free tiers)
- **Timeline:** 24-hour hackathon achievable

---

## Team / Contributors

*Add team member names here*

---

## Resources

- [RxLabelGuard API](https://rxlabelguard.com)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [WebLLM](https://webllm.mlc.ai/)
- [Tailwind CSS](https://tailwindcss.com/)

---

*Generated: March 2026 | Randomize Hackathon*
