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
- **Image Cropping:** `react-easy-crop`

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
- **`models/`**: Defines MongoDB schemas (User, Message, Chat, Status, Notification).
- **`routes/`**: Defines API endpoints and maps them to controllers.
- **`socket/`**: Encapsulates all WebSocket event logic.
- **`middleware/`**: Custom Express middleware for authentication and security.

### Frontend Structure
- **`context/`**: Global state providers for cross-component data sharing.
- **`components/`**: Atomic and molecular UI components (Chat, Profile, Settings, Layout).
- **`services/`**: Modular API and WebSocket interaction logic.
- **`theme/`**: Global styles and theme definitions.

## ✨ Key Features

### 👥 Social & Friends (Instagram Style)
- **User Search:** Search for users by name or email.
- **Friend Requests:** Send "Follow" requests to other users.
- **Instant Updates:** `ChatList` instantly updates when a friend request is accepted.
- **Connection Status:** UI shows "Follow", "Requested", or "Following" based on user relationship.

### 🔔 Notifications
- **Real-time:** Receive instant notifications for new friend requests and acceptances via Socket.io.
- **Professional UI:** Instagram-inspired notification panel with avatars, timestamps, and styled action buttons.
- **Persistent State:** Accepted notifications are permanently marked as "Following".

### 👤 Profile Customization
- **Refined UI:** Polished layout with high-quality typography and improved spacing.
- **Image Cropping:** Users can upload a profile picture, crop it to a 1:1 ratio, and save it.
- **Editable Fields:** Update user `name` and `about` status.
- **Contact View:** View other users' profiles in a clean, read-only mode directly from the chat.

### 💬 Advanced Messaging
- **Real-time Delivery:** Instant message transmission via WebSockets.
- **Message Interactions:**
    - **Swipe-to-Reply:** Gesture-based shortcut to reply to specific messages.
    - **Message Selection:** Multi-select mode via long-press or right-click.
    - **Contextual Action Bar:** WhatsApp-Web-style top bar for Reply, Forward, and Delete actions.
    - **Persistent Replies:** Full rehydration of reply context (quoted blocks) after reloads.
- **Rich Media:** 
    - **Emoji Picker:** Integrated tabbed picker for Emojis, GIFs, and Stickers.
- **Disappearing Messages:** Automatic deletion of messages after 48 hours.
- **Read Receipts:** Visual indicators for delivered and read statuses.
- **Typing Indicators:** Real-time feedback when a user is typing.
- **Group Chats:** Multi-participant conversation support.

### 📱 Status Updates
- **24h Expiry:** Text and image statuses that automatically expire.
- **Status List:** View updates from all contacts in a dedicated panel.

### 🎨 Premium Theming System
- **Brand Modes:** Distinct UI personalities for **Netflix, Google, Spotify, Apple, and Instagram**.
- **Dark & Light Variants:** Each brand mode features dedicated, intentionally designed Dark and Light variants (10 themes total).
- **Visual Personality:** Unique backgrounds (vignettes, glows, gradients) and refined typography (Inter, Manrope) per brand.
- **Header Controls:** Quick-access brand cycle and theme toggle icons in the sidebar.

### 🔒 Security & Authentication
- **Google OAuth:** Secure third-party authentication.
- **Session Management:** Secure token-based sessions with optimized payload to prevent URL-length errors.

### 🛠️ Utilities
- **Responsive Design:** 
    - **Locked Viewport:** Prevents layout shifting on mobile when the keyboard opens.
    - **Dynamic Layout:** Single-pane navigation for phones and two-pane for tablets/desktops.
    - **Stability Fixes:** Resolved "message squishing" and vertical compression issues in the message list.

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
*Last updated: January 12, 2026*
*Latest features: Swipe-to-Reply, Selection Mode, Advanced Theming System, Mobile Layout Fixes*