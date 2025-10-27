const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Passport config (for Google Login)
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL, // Allow requests from our client app
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/chats', require('./routes/chat.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/status', require('./routes/status.routes'));
app.use('/api/backup', require('./routes/backup.routes'));

// Create HTTP server
const httpServer = http.createServer(app);

// --- START FIX: Ensure Socket.IO is initialized correctly ---
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  },
  // Ensure Socket.io can use the WebSocket transport correctly
  transports: ['websocket', 'polling'] 
});
// --- END FIX ---

// Pass the 'io' instance to our socket logic
initSocket(io);

// Health check route
app.get('/', (req, res) => {
  res.send('Chatflix Server is running!');
});

const PORT = process.env.PORT || 5000;
// Render environments often require listening on 0.0.0.0
httpServer.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server running on port ${PORT}`);
});
