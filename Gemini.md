# NETSAPP - Project Documentation

NETSAPP is a high-performance, real-time chat application inspired by WhatsApp. It provides a seamless communication experience with features like instant messaging, status updates, and group chats, built using the MERN stack.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **State Management:** React Context API (Auth, Chat, Socket, Theme)
- **Styling:** Styled-components (Dynamic Theming)
- **Real-time:** Socket.io-client
- **API Client:** Axios
- **Routing:** React Router DOM

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Passport.js (Google OAuth 2.0)
- **Real-time:** Socket.io
- **Middleware:** Express-session, CORS, Auth Middleware

## 🏗️ Architecture

The project follows a modular and decoupled architecture to ensure scalability and maintainability.

### Backend Structure (MVC-ish)
- **`controllers/`**: Handles business logic and coordinates between models and routes.
- **`models/`**: Defines MongoDB schemas (User, Message, Chat, Status).
- **`routes/`**: Defines API endpoints and maps them to controllers.
- **`socket/`**: Encapsulates all WebSocket event logic.
- **`middleware/`**: Custom Express middleware for authentication and security.

### Frontend Structure
- **`context/`**: Global state providers for cross-component data sharing.
- **`components/`**: Atomic and molecular UI components (Chat, Profile, Settings, Layout).
- **`services/`**: Modular API and WebSocket interaction logic.
- **`theme/`**: Global styles and theme definitions.

## ✨ Key Features

### 💬 Messaging
- **Real-time Delivery:** Instant message transmission via WebSockets.
- **Disappearing Messages:** Automatic deletion of messages after 48 hours.
- **Read Receipts:** Visual indicators for delivered and read statuses.
- **Typing Indicators:** Real-time feedback when a user is typing.
- **Group Chats:** Multi-participant conversation support.

### 📱 Status Updates
- **24h Expiry:** Text and image statuses that automatically expire.
- **Status List:** View updates from all contacts in a dedicated panel.

### 🔒 Security & Authentication
- **Google OAuth:** Secure third-party authentication.
- **Session Management:** Secure cookie-based sessions.

### 🛠️ Utilities
- **Backup & Restore:** Framework for synchronizing chat history with Google Drive.
- **Dark Mode:** System-wide support for light and dark themes.
- **Responsive Design:** Optimized for both mobile and desktop views.

## 📂 Project Structure

```text
NETSAPP/
├── client/                 # React Frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # UI Components
│       ├── context/        # State Management
│       ├── services/       # API/Socket Logic
│       └── theme/          # Styled-components context
└── server/                 # Express Backend
    ├── config/             # Database and Auth config
    ├── controllers/        # Business Logic
    ├── models/             # Mongoose Schemas
    ├── routes/             # API Endpoints
    └── socket/             # WebSocket logic
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB instance
- Google OAuth Credentials

### Installation
1. Install server dependencies: `cd server && npm install`
2. Install client dependencies: `cd client && npm install`
3. Configure environment variables in `server/.env` and `client/.env`.

---
*Last updated: January 10, 2026*
