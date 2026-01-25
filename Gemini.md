# NETSAPP (Chatflix) - Project Documentation

**Chatflix** (formerly NETSAPP) is a premium, high-performance real-time chat application built on the MERN stack. It features a unique "Brand Mode" theming engine, allowing users to switch between Netflix, Spotify, Apple, Google, and Instagram-inspired interfaces.

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
- **Authentication:** Passport.js (Google OAuth 2.0) + JWT (365-day persistence)
- **Real-time:** Socket.io
- **Search:** MongoDB Aggregation Pipeline (Weighted Prefix Matching)

## ✨ Key Features

### 🎨 Premium Theming System (Brand Modes)
- **Netflix Mode:** Cinematic Dark, Red Accents, 'Archivo' font.
- **Spotify Mode:** Deep Black, Vibrant Green, 'Montserrat' font.
- **Apple Mode:** Clean, Glassmorphism, San Francisco-style font.
- **Instagram Mode:** Gradient borders, Pink accents, Social layout.
- **Google Mode:** Material Design, Playful colors.
- **Theme-Aware Components:** Send buttons, ticks, and layouts adapt to the active brand.

### 👥 Social Graph (Followers/Following)
- **Unilateral Connections:** Instagram-style Follow system (replacing legacy Friend Requests).
- **Profile Hub:** 
    - Stats for Followers/Following.
    - Clickable lists to view connections (Modal view).
    - Optimistic UI updates for instant feedback.
- **Smart Integration:** Following a user automatically ensures they appear in the Chat List.

### 🔍 Advanced Search
- **Algorithm:** MongoDB Aggregation Pipeline using `$regexMatch` and `$cond` to prioritize names *starting with* the query over partial matches.
- **Performance:** 50ms debounce time for near-instant reactivity.
- **Indexing:** DB-level indexes on `name` and `email`.

### 💬 Messaging Experience
- **Smart Spacing:** Dynamic vertical margins grouping consecutive messages from the same sender (1px/2px) vs. different senders (12px/16px).
- **Rich Interaction:** Swipe-to-Reply, Message Forwarding, Context Menus.
- **Visuals:** WhatsApp-style ticks with high-contrast colors.
- **Loaders:** Skeleton screens for smooth data fetching transitions.

### 📱 UI/UX Polish
- **Landing Page:** "Chatflix" cinematic landing page with floating animations and minimalist design.
- **Input:** Floating pill-shaped input bar.
- **Notifications:** "Improvised" layout with deduplication and smooth animations.

## 🏗️ Architecture

### Backend Structure
- **`controllers/`**: 
    - `user.controller.js`: Handles profile, search (aggregation), and social graph (follow/unfollow).
    - `chat.controller.js`: Manages chat creation and message retrieval.
- **`models/`**: 
    - `User`: Includes `followers` and `following` arrays.
    - `Notification`: Supports `follow` and `friend_request` types.
- **`socket/`**: Real-time event handling for messages and notifications.

### Frontend Structure
- **`context/`**: Global state. `ChatContext` optimized to prevent re-fetches on user profile updates.
- **`components/`**: 
    - `ProfileDrawer`: Handles profile viewing, editing, and social stats.
    - `UserListModal`: Reusable modal for viewing user lists.
    - `Skeleton`: Reusable loading component.

## 🛠️ Status & Todo
- [x] **Project Rename:** Rebranded to "Chatflix".
- [x] **Search:** Optimized to "Best Algorithm" (Prefix Priority).
- [x] **Social:** Full Followers/Following implementation.
- [x] **UI:** Final spacing and font adjustments completed.
- [ ] **Backup:** UI updated, backend logic mocked/placeholder.

---
*Last updated: January 14, 2026*
*Latest Milestone: Final Polish & "Chatflix" Rebranding*