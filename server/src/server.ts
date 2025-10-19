import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { configRouter } from './controllers/configController.js';
import { pdfRouter } from './controllers/pdfController';
import { getDatabase } from './database/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Initialize database on startup
(async () => {
  try {
    await getDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AutoNotes Server',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/pdf', pdfRouter);
app.use('/api/config', configRouter);

// 404 handler
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AutoNotes Server running on http://localhost:${PORT}`);
  console.log(`📄 PDF Generation: http://localhost:${PORT}/api/pdf`);
  console.log(`⚙️  Configuration: http://localhost:${PORT}/api/config`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

export default app;
