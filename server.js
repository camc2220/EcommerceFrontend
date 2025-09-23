// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL || 'https://your-app.railway.app';

// Verificar que la carpeta dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: dist folder does not exist. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ dist folder exists');

// Servir archivos estáticos
app.use(express.static(distPath));

// Health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'ecommerce-frontend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(distPath, 'index.html'));
  } catch (error) {
    res.status(500).json({ error: 'index.html not found' });
  }
});

// Para React Router - todas las demás rutas van al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 ecommerce-frontend running successfully!`);
  console.log(`📍 Internal container: http://localhost:${PORT}`);
  console.log(`📍 Public URL: ${RAILWAY_STATIC_URL}`);
  console.log(`📍 Health check: ${RAILWAY_STATIC_URL}/health`);
  console.log('='.repeat(60));
});