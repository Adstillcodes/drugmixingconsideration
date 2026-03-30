const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend.onrender.com';

function ping() {
  console.log(`[${new Date().toISOString()}] Pinging backend...`);
  
  https.get(`${BACKEND_URL}/api/health`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`[${new Date().toISOString()}] Health check response:`, json.status);
      } catch (e) {
        console.log(`[${new Date().toISOString()}] Response:`, data);
      }
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error pinging backend:`, err.message);
  });
}

ping();

setInterval(ping, 5 * 60 * 1000);
