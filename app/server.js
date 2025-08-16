// server.js

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const indexRoute=require("../app/routes/index")
const connectDB = require("./config/db");
const app = express();
const fileUpload = require('express-fileupload');
const PORT = process.env.PORT || 8000;
const passport = require('passport');
app.use(passport.initialize());

// Load JWT strategy
require('./config/passport')(passport);

connectDB();
// ----------------------
// Middleware
// ----------------------
app.use(helmet());          // Security headers
app.use(express.json());    // Parse JSON bodies
app.use(morgan('dev'));     // HTTP logging in dev mode
app.use(
  cors({
    origin: "http://localhost:5173", // your Vite frontend
    credentials: true,               // allow cookies / auth headers
    methods: ["GET", "POST", "PUT","PATCH","DELETE", "OPTIONS"], // allow all needed methods
    allowedHeaders: ["Content-Type", "Authorization"],     // allow JWT in headers
    exposedHeaders: ["Content-Disposition"]
  })
);
// 👇 add this
app.use(fileUpload({
  createParentPath: true, // Automatically create directories if they don't exist
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  abortOnLimit: true, // Abort request if file exceeds limit
  responseOnLimit: 'File size limit has been reached',
  useTempFiles: true, // Store files temporarily on disk
  tempFileDir: '/tmp/', // Directory for temporary files
}));

// Serve static files (optional, if you need to serve uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ----------------------
// Routes
// ----------------------
app.get('/', (req, res) => {
  res.json({ message: 'Server is running 🚀' });
});

app.get('/api/hello', (req, res) => {
  res.json({ success: true, data: 'Hello World!' });
});

app.use('/api/',indexRoute)

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ----------------------
// Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ----------------------
// Start Server
// ----------------------
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// ----------------------
// Graceful Shutdown
// ----------------------
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('\n⏳ Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}
