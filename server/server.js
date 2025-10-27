const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket');

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

// Passport config (for Google Login) - MUST run after dotenv.config()
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // Allow requests ONLY from our Vercel client
  credentials: true // Allow cookies/auth headers if needed later
}));
app.use(express.json()); // Parse JSON request bodies
app.use(passport.initialize()); // Initialize Passport

// API Routes - Make sure this is registered correctly
app.use('/api/auth', require('./routes/auth.routes')); // <--- Ensure this line exists
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/chats', require('./routes/chat.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/status', require('./routes/status.routes'));
app.use('/api/backup', require('./routes/backup.routes'));

// Create HTTP server needed for Socket.IO
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL, // Allow websocket connections ONLY from our Vercel client
    methods: ['GET', 'POST']
  }
});

// Pass the 'io' instance to our socket logic file
initSocket(io);

// Simple health check route
app.get('/', (req, res) => {
  res.send('Chatflix Server is running!');
});

// Start listening for requests
const PORT = process.env.PORT || 5000; // Render provides PORT env variable
httpServer.listen(PORT, () => {
  // Use 0.0.0.0 for Render deployments, localhost for local
  console.log(`Server running on port ${PORT}`);
});
