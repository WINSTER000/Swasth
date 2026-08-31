const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const facilityRoutes = require('./routes/facilities');
const appointmentRoutes = require('./routes/appointments');
const queueRoutes = require('./routes/queue');
const recordRoutes = require('./routes/records');
const referralRoutes = require('./routes/referrals');
const followupRoutes = require('./routes/followups');
const medicineRoutes = require('./routes/medicines');
const diagnosticRoutes = require('./routes/diagnostics');
const aiRoutes = require('./routes/ai');
const riskRoutes = require('./routes/risk');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const mapsRoutes = require('./routes/maps');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

// Connect Database
connectDB();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Rate Limiting (Relaxed to 5000 requests per 15 minutes to prevent 429 status code on interactive maps & Socket.IO)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'development', // Bypass rate limit in development
});
app.use('/api', limiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/risk-assessments', riskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'SWASTH AI-Assisted Rural Healthcare',
    timestamp: new Date(),
  });
});

// Real-time Socket.IO Connection Handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join-facility-room', (facilityId) => {
    socket.join(`facility-${facilityId}`);
  });

  socket.on('join-teleconsult-room', (roomId) => {
    socket.join(`teleconsult-${roomId}`);
  });

  socket.on('webrtc-offer', ({ roomId, offer }) => {
    socket.to(`teleconsult-${roomId}`).emit('webrtc-offer', { offer, sender: socket.id });
  });

  socket.on('webrtc-answer', ({ roomId, answer }) => {
    socket.to(`teleconsult-${roomId}`).emit('webrtc-answer', { answer, sender: socket.id });
  });

  socket.on('webrtc-ice-candidate', ({ roomId, candidate }) => {
    socket.to(`teleconsult-${roomId}`).emit('webrtc-ice-candidate', { candidate, sender: socket.id });
  });

  socket.on('end-teleconsult', ({ roomId }) => {
    socket.to(`teleconsult-${roomId}`).emit('teleconsult-ended');
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`  SWASTH API & SOCKET SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=============================================================`);
});
