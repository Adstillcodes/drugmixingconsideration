import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeInteractions } from './routes/analyze.js';
import { searchDrugs } from './routes/drugs.js';
import { processOCR } from './routes/ocr.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['https://dose-wise.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', analyzeInteractions);
app.get('/api/drugs/search', searchDrugs);
app.post('/api/ocr', processOCR);

app.use((err, req, res) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Dose-Wise backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
