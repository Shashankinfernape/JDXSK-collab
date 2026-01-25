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
- **Storage:** Local Disk Storage (via Multer) for Voice & Images.

## ✨ Key Features

### 🎙️ AI Voice Assistant (Mic x AI)
- **Voice Commands:** Intelligent parsing of commands like *"Message Alice hi"*, *"Ask Sunil if he's free"*, or *"Eshwar ku hi sollu"* (Tanglish).
- **Advanced Matching:** Jaro-Winkler distance + Phonetic scoring + Recency boosting to find the correct contact even if misheard.
- **POV Transformation:** Automatically converts 3rd person requests to 1st person messages (e.g., *"Ask him if he is coming"* -> *"Are you coming?"*).
- **Confirmation UI:** Google Assistant-style portal overlay with silence detection and manual redo/confirm controls.

### 🎤 Voice Messaging (WhatsApp Grade)
- **Press & Hold:** Native-feeling recording logic with global release listeners.
- **Static Waveform:** WhatsApp-style mirrored bar visualizer that fills up progressively during playback.
- **Rich Player:** Dedicated audio player bubble with sender profile picture and duration tracking.
- **Infrastructure:** Seamless integration with backend Multer-based upload system.

### 🎨 Premium Theming System (Brand Modes)
- **Dynamic Adaptability:** All new features (Voice, AI, Emojis) automatically sync with the active Brand (Netflix Red, Spotify Green, etc.).
- **Premium UI:** Refined scrollbars (thinner, semi-transparent), clean Portals for overlays, and high-performance animations.

### 👥 Social Graph & Search
- **Unilateral Connections:** Instagram-style Follow system.
- **Fuzzy Search:** High-performance MongoDB aggregation combined with frontend fuzzy matching.

### 💬 Messaging Experience
- **Disappearing Messages:** Optional 24-hour expiration setting per chat (Permanent by default).
- **WhatsApp Emotes:** Massive emoji library categorized by standard WhatsApp sections + "Chatflix Refiner" for custom assets.
- **Smart Spacing:** Sequence-aware vertical margins for grouped messages.

## 🏗️ Architecture

### Backend Structure
- **`controllers/`**: 
    - `message.controller.js`: Handles file uploads (audio/images) and metadata.
    - `chat.controller.js`: Manages chat settings (disappearing messages) and lists.
- **`middleware/`**:
    - `upload.middleware.js`: Configures Multer for local file processing.
- **`socket/`**: Real-time event logic with setting-aware TTL for disappearing messages.

### Frontend Structure
- **`components/common/`**: 
    - `VoiceAssistant.jsx`: Portal-based AI voice interface.
    - `AudioVisualizer.jsx`: Canvas-based waveform engine.
- **`components/chat/`**: 
    - `AudioPlayer.jsx`: Professional in-bubble playback UI.
    - `EmojiPicker.jsx`: Expanded categorized emoji system.

## 🛠️ Status & Todo
- [x] **Project Rename:** Rebranded to "Chatflix".
- [x] **AI Voice Assistant:** Full implementation with POV and Fuzzy Matching.
- [x] **Voice Messages:** WhatsApp-grade recording and waveform player.
- [x] **Settings:** Added Disappearing Messages toggle.
- [x] **Emojis:** Categorized WhatsApp-style picker.
- [ ] **Cloud Storage:** Migration from local `uploads/` to S3/Cloudinary.

---
*Last updated: January 25, 2026*
*Latest Milestone: Voice Assistant & Messaging Rework*
