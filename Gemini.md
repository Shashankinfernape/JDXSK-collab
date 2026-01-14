# NETSAPP - Project Documentation

NETSAPP is a high-performance, real-time chat application inspired by WhatsApp. It provides a seamless communication experience with features like instant messaging, status updates, and group chats, built using the MERN stack.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **State Management:** React Context API (Auth, Chat, Socket, Theme)
- **Styling:** Styled-components (Dynamic CSS-in-JS)
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
    - **Message Forwarding:** Dedicated forwarding screen with contact search, checklist, and content preview.
- **Rich Media:** 
    - **Emoji Picker:** Integrated tabbed picker for Emojis, GIFs, and Stickers.
- **Disappearing Messages:** Automatic deletion of messages after 48 hours.
- **Typing Indicators:** Real-time feedback when a user is typing.
- **Group Chats:** Multi-participant conversation support.

### ✅ WhatsApp-Style Tick System
- **Full Lifecycle:** 
    - **Clock (🕓):** Message is sending (Optimistic state).
    - **Single Gray Tick (✓):** Sent to server.
    - **Double Gray Tick (✓✓):** Delivered to recipient's device.
    - **Double Blue Tick (✓✓):** Message read by recipient.
- **Robust Logic:** Improved optimistic replacement ensures the clock icon transitions to ticks instantly upon server acknowledgment.

### 📱 Status Updates
- **24h Expiry:** Text and image statuses that automatically expire.
- **Status List:** View updates from all contacts in a dedicated panel.

### 🎨 Premium Theming System
- **Brand Modes:** Distinct UI personalities for **Netflix, Google, Spotify, Apple, and Instagram**.
- **Fixed Identity:** Corrected style "leakage" to ensure each brand has its unique colors and bubble geometry.
    - **Netflix:** Cinematic Dark (Pure black bg, deep red accents).
    - **Instagram:** Clean Messenger style (Standard Blue bubbles, no gradient overload).
- **Subtle Rounding:** Standardized, professional border-radii (8px - 18px) for a non-toy-like appearance.

### 🔒 Security & Authentication
- **Google OAuth:** Secure third-party authentication.
- **Session Management:** Secure token-based sessions with optimized payload.

### 🛠️ Utilities & Layout
- **Wider Bubbles:** Optimized for readability with **80-90% width** (mobile/desktop).
- **Floating Input Bar:** 
    - **"Fake Bubble" Pill:** Input area mimics chat messages for a modern look.
    - **Transparent Container:** Wallpaper remains visible behind the input area.
    - **Push-up Motion:** Messages smoothly animate upwards when replying to create space.
- **Responsive Spacing:** Dynamic bottom padding prevents input bar from overlapping chat content.

---
*Last updated: January 13, 2026*
*Latest features: Forwarding Screen, Edge-to-Edge Replies, Floating Input Pill, Strict Tick System*
