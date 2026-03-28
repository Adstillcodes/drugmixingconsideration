# Dose-Wise Backend

Backend API for the Dose-Wise drug interaction analyzer.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure API key:**
   - Edit `.env` file
   - Replace `your_groq_api_key_here` with your Groq API key
   - Get your key at: https://console.groq.com/keys

3. **Start the server:**
   ```bash
   npm start
   ```

   The server will run at `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```

### Analyze Drug Interactions
```
POST /api/analyze
Content-Type: application/json

{
  "medications": [
    { "name": "Warfarin", "dosage": "5mg" },
    { "name": "Aspirin", "dosage": "81mg" }
  ],
  "userContext": {
    "gender": "male",
    "age": 45,
    "conditions": ["Hypertension"],
    "pregnant": false,
    "lactating": false
  }
}
```

### Search Drugs
```
GET /api/drugs/search?q=metformin&limit=10
```

### Process Prescription (OCR)
```
POST /api/ocr
Content-Type: application/json

{
  "image": "base64_encoded_image_data"
}
```

## Running with Frontend

1. Start backend: `npm start` (in backend folder)
2. Start frontend: `npm run dev` (in project root)
3. Frontend calls backend at `http://localhost:3001/api`

## API Features

- **Drug Interactions**: Checks 50+ known drug interactions
- **AI Summaries**: Uses Groq API for intelligent analysis summaries
- **Drug Search**: Uses RxNorm API for drug autocomplete
- **OCR**: Uses Tesseract.js for prescription text extraction
