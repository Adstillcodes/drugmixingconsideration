const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction 
  ? 'https://dose-wise-api.onrender.com/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

export async function analyzeInteractions(medications, userContext) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medications,
        userContext,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis API Error:', error);
    throw error;
  }
}

export async function searchDrugs(query, limit = 20) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/drugs/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Drug search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Drug Search API Error:', error);
    throw error;
  }
}

export async function processOCR(imageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });

    if (!response.ok) {
      throw new Error('OCR processing failed');
    }

    return await response.json();
  } catch (error) {
    console.error('OCR API Error:', error);
    throw error;
  }
}
