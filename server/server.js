const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket');

// Last Updated: Fix Reply Persistence & Auth Revert
dotenv.config();
connectDB();
require('./config/passport');

const app = express();

// --- CORS Middleware for REST API ---
// Apply stricter CORS here if needed, but allow client origin
app.use(cors({
  origin: process.env.CLIENT_URL, // Use environment variable
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

// --- API Routes ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/chats', require('./routes/chat.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/status', require('./routes/status.routes'));
app.use('/api/backup', require('./routes/backup.routes'));

// --- HTTP Server Setup ---
const httpServer = http.createServer(app);

// --- Socket.IO Server Setup (Explicit Configuration) ---
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL, // CRITICAL: Use the exact client URL from ENV
    methods: ["GET", "POST"],
    credentials: true
  },
  // Adding allowEIO3 for potential compatibility issues
  allowEIO3: true, 
  transports: ['websocket', 'polling'] // Allow both standard transports
});

// Pass the configured io instance to the socket logic file
initSocket(io);

// Health check
app.get('/', (req, res) => {
  res.send('Chatflix Server is running!');
});

const PORT = process.env.PORT || 5000;
// Listen on all interfaces for Render compatibility
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

