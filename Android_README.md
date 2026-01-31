# Android Chatflix (NETSAPP) - Development Specification

**Project Goal:** Build a native Android application (Kotlin/XML) that fully replicates the functionality, UI, and theming of the existing React web application "Chatflix".

**Target Architecture:**
*   **Language:** Kotlin
*   **UI Framework:** Native XML Layouts (ViewBinding recommended)
*   **Architecture:** MVVM (Model-View-ViewModel)
*   **Networking:** Retrofit + OkHttp (REST API)
*   **Real-time:** Socket.IO Client (Native Java/Kotlin Library)
*   **Image Loading:** Coil or Glide
*   **Navigation:** Jetpack Navigation Component

---

## 1. Theme & Styling (`res/values/colors.xml`)

The app features a dynamic "Brand Mode" system. You must define these base colors and programmatic theme switching logic.

### Base Colors (Dark Mode Default)
| Resource Name | Hex Code | Description |
| :--- | :--- | :--- |
| `colorBackground` | `#121212` | Main app background |
| `colorPanelBackground` | `#181818` | Sidebar/Header background |
| `colorInputBackground` | `#2A2A2A` | Search bars & Input fields |
| `colorTextPrimary` | `#E5E5E5` | Main text |
| `colorTextSecondary` | `#A0A0A0` | Subtitles, timestamps |
| `colorDivider` | `#2A2A2A` | List separators |
| `colorIcon` | `#B3B3B3` | Inactive icons |

### Brand Palettes (Dynamic Switching)
Implement a `ThemeManager` singleton to toggle these primary colors.

| Brand | Primary Color | Bubble Radius | Font Style |
| :--- | :--- | :--- | :--- |
| **Netflix** | `#E50914` | `8dp` (Boxy) | Bold/Cinematic |
| **Spotify** | `#1DB954` | `12dp` (Rounded) | Modern |
| **Apple** | `#007AFF` | `16dp` (iOS) | System Standard |
| **Google** | `#1A73E8` | `12dp` (Clean) | Minimal |
| **Instagram** | `#E1306C` | `18dp` (Round) | Gradient Border (Story style) |

---

## 2. API & Network Configuration

**Base URL:**
*   Production: `https://jdxsk-collab.onrender.com/api/`
*   Localhost: `http://10.0.2.2:5000/api/` (Android Emulator loopback)

**Endpoints:**
*   `POST /auth/google` - Login
*   `GET /chats` - Fetch chat list
*   `POST /messages` - Send text message
*   `POST /messages/upload` - Send image/audio (Multipart)
*   `GET /users/search?q={query}` - Global user search

**Authentication:**
*   Store JWT Token in `EncryptedSharedPreferences`.
*   Add `Authorization: Bearer <token>` to all Retrofit requests via an `Interceptor`.

---

## 3. UI Specifications & Layouts

### A. Splash & Login Activity
*   **Layout:** Center Logo. "Login with Google" button (Material Button style).
*   **Logic:** Check `SharedPreferences` for existing token. If valid -> `MainActivity`, else -> Stay.

### B. Main Activity (Home)
**Layout Structure:**
*   **Top Bar (`Toolbar`):**
    *   **Left:** User Avatar (Circular, 40dp). *Click opens Profile Drawer.*
    *   **Right:**
        *   Theme Switcher Icon (cycles brands).
        *   Dark/Light Mode Toggle.
        *   Notification Bell (with badge).
        *   Overflow Menu (Vertical Dots).
*   **Search Bar:**
    *   Below Top Bar.
    *   Background: `#2A2A2A` (Dark) / `#F0F0F0` (Light).
    *   Corner Radius: `8dp`.
    *   Icon: Magnifying Glass (Left).
*   **Chat List (`RecyclerView`):**
    *   **Item Layout (`item_chat.xml`):**
        *   Avatar: 50dp x 50dp, Circular.
        *   Title: Bold, Primary Text Color.
        *   Subtitle: Last message content (Truncated, Secondary Color).
        *   Time: Top right, small font.
        *   Unread Badge: Primary Color circle with count.

### C. Chat Detail Activity
**Layout Structure:**
*   **Header:**
    *   Back Button.
    *   User Avatar & Name (Online status subtitle).
*   **Message List (`RecyclerView`):**
    *   Background: Theme-specific (Netflix = Black, Spotify = Dark Gray).
    *   **Message Bubbles:**
        *   **Me:** Aligned Right. Background = `colorPrimary`. Text = White.
        *   **Other:** Aligned Left. Background = `#2A2A2A`. Text = Primary.
        *   **Ticks:** Single Grey (Sent), Double Gray (Delivered), Double Blue (Read).
*   **Input Area (Bottom):**
    *   Emoji Button (Left).
    *   Text Field (Rounded, Transparent background).
    *   **Mic Button:**
        *   *Hold* to record (Ripple animation).
        *   *Release* to send.
        *   *Swipe Left* to cancel.

### D. Voice Assistant (Overlay)
*   **Implementation:** A `DialogFragment` or `BottomSheetDialogFragment`.
*   **UI:**
    *   Centered Microphone FAB (Floating Action Button).
    *   Waveform animation (Lottie or Custom View) when listening.
    *   Text feedback: "Listening...", "Processing...", "Sent!".
*   **Logic:** Use Android `SpeechRecognizer`. Match keywords locally or send text to backend if needed.

---

## 4. Key Features to Implement

### 1. Real-time Messaging (Socket.IO)
*   **Events:**
    *   `connect`: Register user ID.
    *   `receiveMessage`: Append to `MessageList` adapter.
    *   `messageDelivered` / `messageRead`: Update ticks in adapter.
    *   `typing`: Show "Typing..." indicator.

### 2. Audio Messages
*   **Recording:** Use `MediaRecorder` (Output format: AAC/M4A).
*   **Playback:** Use `ExoPlayer`.
*   **UI:** Seek bar (Waveform visualizer ideal, standard seekbar MVP).

### 3. Search Functionality
*   **Local Filter:** Filter the `ChatListAdapter` list as user types.
*   **Global Search:** If no local match, trigger API call `GET /users/search` and show separate section "Global Results".

### 4. Theming Engine
*   Create a `ThemeManager` class.
*   When "Theme Switcher" is clicked:
    1.  Update `colorPrimary` in runtime (if using dynamic colors) or recreate Activity with new Theme resource.
    2.  Save preference to `SharedPreferences`.
    3.  Restart `MainActivity` to apply.

---

## 5. File Structure Recommendation

```
com.netsapp.chatflix
├── data
│   ├── api (Retrofit Service, Interceptors)
│   ├── model (User, Chat, Message data classes)
│   ├── repository (ChatRepository, UserRepository)
│   └── pref (TokenManager)
├── di (Hilt/Dagger Modules - Optional but recommended)
├── ui
│   ├── adapters (ChatAdapter, MessageAdapter)
│   ├── auth (LoginActivity, AuthViewModel)
│   ├── home (MainActivity, HomeViewModel)
│   ├── chat (ChatActivity, ChatViewModel)
│   └── common (VoiceOverlay, AudioPlayerView)
├── utils (DateFormatter, Constants, Extensions)
└── App.kt (Application class, Socket init)
```

This specification provides a 1:1 mapping of the Web React app to Android Native standards.