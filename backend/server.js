const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const { setupSocket } = require('./socketManager');
const { startEmergencyScheduler } = require('./jobs/emergencyScheduler');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const documentRoutes = require('./routes/documentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = setupSocket(server);

// Global Middleware
const allowedOrigin = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// COOP/COEP headers for Google OAuth compatibility
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/doctors', apiLimiter, doctorRoutes);
app.use('/api/appointments', apiLimiter, appointmentRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/prescriptions', apiLimiter, prescriptionRoutes);
app.use('/api/documents', apiLimiter, documentRoutes);
app.use('/api/payment', apiLimiter, paymentRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/wallet', apiLimiter, walletRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MediConnect server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);

  // Start the emergency scheduler
  startEmergencyScheduler();
});