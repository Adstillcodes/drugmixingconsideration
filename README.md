# Dose-Wise - Drug Interaction Analyzer

A web application for analyzing prescription drug interactions with AI-powered insights.

## Quick Start

### 1. Setup Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and add your Groq API key:
```
GROQ_API_KEY=gsk_your_key_here
```

Start the backend:
```bash
npm start
```

### 2. Setup Frontend

```bash
# From project root
npm install
npm run dev
```

### 3. Open Browser

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Getting Started

1. **Select Prescription Type**: Choose "Self-prescribed" or "Active prescription"
2. **Enter Demographics**: Gender and age
3. **Add Medications**: Search and add your medications
4. **Upload Prescription** (optional): Upload a photo for AI extraction
5. **Run Analysis**: Get drug interaction results with AI insights

## Tech Stack

- **Frontend**: React, Tailwind CSS, i18next
- **Backend**: Express.js, Node.js
- **APIs**: Groq (AI), RxNorm (drug search)
- **OCR**: Tesseract.js

## Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/analyze` | POST | Analyze drug interactions |
| `/api/drugs/search` | GET | Search drugs |
| `/api/ocr` | POST | Extract text from prescription |

## License

MIT
