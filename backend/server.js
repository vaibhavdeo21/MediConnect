const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// --- ADD THIS DEBUGGING CODE ---
app.use((req, res, next) => {
  console.log(`Received Request: ${req.method} ${req.url}`);
  next();
});
// -------------------------------

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});