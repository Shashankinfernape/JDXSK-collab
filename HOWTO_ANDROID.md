# Chatflix Android: The Definitive Technical Masterplan

This document is the absolute authority on recreating the Chatflix web application as a native Android (Kotlin) app. It contains the exact logic, architectural patterns, and UI specifications required for a 1:1 parity with the premium web experience.

---

## 1. Project Foundation

### Tech Stack
- **Architecture:** MVVM with Clean Architecture principles.
- **Networking:** Retrofit 2 + OkHttp 4 (with Auth Interceptors).
- **Socket.io:** `socket.io-client-java` v2.1.0.
- **Dependency Injection:** Hilt.
- **Concurrency:** Coroutines + StateFlow/SharedFlow.
- **Local Storage:** Room (for chat caching) + EncryptedSharedPreferences (for JWT).

---

## 2. API & Data Layer

### `ChatflixApi.kt`
Define all endpoints exactly as they exist in the Node.js backend.

```kotlin
interface ChatflixApi {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @GET("api/chats")
    suspend fun getChats(): List<Chat>

    @GET("api/messages/{chatId}")
    suspend fun getMessages(@Path("chatId") chatId: String): List<Message>

    @Multipart
    @POST("api/messages")
    suspend fun sendMessage(
        @Part("chatId") chatId: RequestBody,
        @Part("content") content: RequestBody?,
        @Part file: MultipartBody.Part?,
        @Part("replyTo") replyTo: RequestBody?
    ): Response<Message>

    @POST("api/users/follow/{userId}")
    suspend fun followUser(@Path("userId") userId: String): Response<FollowResponse>
}
```

---

## 3. Real-Time Sync Logic

### Socket Event Mapping
| Web Event | Android Implementation | Description |
| :--- | :--- | :--- |
| `joinRoom` | `mSocket.emit("joinRoom", chatId)` | Call when opening a ChatDetailActivity. |
| `receiveMessage` | `mSocket.on("receiveMessage") { ... }` | Parse JSON to `Message` model and add to adapter. |
| `typing` | `mSocket.emit("typing", chatId)` | Trigger on `EditText` text change. |
| `userStatus` | `mSocket.on("userStatus") { ... }` | Update the "Online/Offline" indicator in the Toolbar. |

---

## 4. UI Layer: The "Brand Mode" Engine

### Color Logic (The "Magic" of Chatflix)
The Android app must dynamically update colors based on the `Brand` selected.

**Sent Message Stripe Logic:**
```kotlin
fun getStripeColor(isSent: Boolean, brand: Brand, mode: Mode): Int {
    return if (isSent) {
        if (mode == Mode.DARK) Color.parseColor("#B3FFFFFF") // White 70%
        else getBrandPrimaryColor(brand)
    } else {
        getBrandPrimaryColor(brand)
    }
}
```

### Layout: `item_message_sent.xml`
The message bubble structure:
- **Root:** `ConstraintLayout` (match_parent width).
- **Bubble Container:** `CardView` or `ShapeableImageView` (max_width 80%).
- **Reply Preview:** 
    - A child `LinearLayout` inside the bubble.
    - Left-border `View` (4px width) for the stripe.
    - Background: `#1AFFFFFF` (Dark) or `#0F000000` (Light).
- **Text:** `TextView` with `autoLink="all"`.
- **Timestamp:** Small `TextView` at the bottom right.

---

## 5. Feature-Specific Details

### Instagram-Style Follow System
- **Model:** The `User` object contains `isFollowing` (Boolean) and `connectionStatus` (String: "following", "requested", "none").
- **UI:** In `UserListModal`, the button text/color must change dynamically:
    - "Following" -> Transparent background, Brand Color border.
    - "Follow" -> Solid Brand Color background.

### Disappearing Messages
- **Backend Logic:** Messages have an `expiresAt` field.
- **Frontend Logic:** If `chat.isDisappearing` is true, the `MessageAdapter` should show a "clock" icon next to the timestamp. The app should perform a local check: `if (currentTime > expiresAt) hideMessage()`.

### The "Nuclear" Voice Implementation
- **Recording:** Save as `.webm` or `.mp4`.
- **Playback UI:** 
    - Circular `Play/Pause` button (Brand Color).
    - Duration `TextView` (e.g., "0:12").
    - Static Waveform: Use a `LayerDrawable` where the top layer is a "Progress" clip that reveals the colored bars.

---

## 6. Deep Linking & Auth Flow

1. User clicks "Login with Google".
2. App opens `https://your-backend.com/api/auth/google` in Chrome Custom Tabs.
3. Backend authenticates and redirects to `chatflix://auth?token=JWT_VALUE`.
4. `LoginActivity` handles the intent:
   ```kotlin
   intent?.data?.getQueryParameter("token")?.let { token ->
       saveToken(token)
       navigateToMain()
   }
   ```

---

## 7. Configuration & Optimization

### `styles.xml`
Define themes for all 5 brands to allow `setTheme(R.style.Theme_Netflix)` in `onCreate()`.

### Image Optimization
Use Glide's `.diskCacheStrategy(DiskCacheStrategy.ALL)` to cache profile pics and sent images, as the web app does.

### Proguard Rules
Ensure Socket.io and Gson classes are not obfuscated to prevent runtime crashes.

---

## 8. AI Voice Assistant (Mic x AI)

### The Assistant UI
- **Type:** Full-screen `DialogFragment` or `BottomSheetDialogFragment` with `android:background="@android:color/transparent"`.
- **Overlay:** A circular pulse animation (using `ObjectAnimator`) in the center.
- **Silence Detection:** Use `AudioRecord` to monitor `amplitude`. If `amplitude < threshold` for 2 seconds, stop recording and send to backend.

### Fuzzy Matching Logic (Jaro-Winkler)
Since the user may say names like "Eshwar" but the contact is "Eshwar Kumar", implement a local fuzzy search:
1. **Library:** Use `info.debatty.java-string-similarity`.
2. **Algorithm:** 
   ```kotlin
   val similarity = JaroWinkler().similarity("Eshwar", contact.name)
   if (similarity > 0.85) { /* Match Found! */ }
   ```
3. **POV Transformation:** The backend (`api/voice/process`) handles the 3rd-to-1st person conversion, so the Android app only needs to send the raw transcript and target user ID.

---
*Documented by Gemini CLI for the NETSAPP Development Team.*
*Date: February 20, 2026*
---
