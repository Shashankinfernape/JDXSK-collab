# NETSAPP (Chatflix) - Color Specification

This document provides a detailed breakdown of the color system used across the Chatflix application, including brand-specific palettes, functional UI colors, and minute design details like message stripes.

## 🎨 Core Brand Palettes
The application uses a dynamic "Brand Mode" system. Each brand defines a primary accent and specific bubble characteristics.

| Brand | Primary Color | Font Family | Bubble Radius |
| :--- | :--- | :--- | :--- |
| **Netflix** | `#E50914` (Red) | Archivo | 8px |
| **Spotify** | `#1DB954` (Green) | Montserrat | 12px |
| **Apple** | `#007AFF` (Blue) | -apple-system | 16px |
| **Google** | `#1A73E8` (Blue) | Google Sans | 12px |
| **Instagram** | `#E1306C` (Pink) | -apple-system | 18px |

> **Instagram Gradient:** `linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)`

---

## 🌓 Theme Modes (Global Defaults)
Base colors used when not overridden by specific brand logic.

| Element | Dark Mode | Light Mode |
| :--- | :--- | :--- |
| **Background** | `#121212` | `#FFFFFF` |
| **Panel/Sidebar** | `#181818` | `#F5F5F5` |
| **Chat Wall** | `#0F0F0F` | `#E5DDD5` |
| **Input Bar** | `#2A2A2A` | `#FFFFFF` |
| **Text (Primary)** | `#E5E5E5` | `#111B21` |
| **Text (Secondary)** | `#A0A0A0` | `#667781` |
| **Border** | `#2A2A2A` | `#D1D7DB` |

---

## 💬 Message Bubbles
Bubble colors shift dynamically based on whether the message is sent (`isMe`) or received (`isOther`).

| Brand | Sent (isMe) | Received (isOther) |
| :--- | :--- | :--- |
| **Netflix (Dark)** | `#B9090B` (Muted Red) | `#2F2F2F` (Cinematic Gray) |
| **Spotify (Dark)** | `#1DB954` (Green) | `#282828` (Spotify Gray) |
| **Apple (Dark)** | `#0A84FF` (iOS Blue) | `#2C2C2E` (Gray 5) |
| **Apple (Light)** | `#007AFF` (Blue) | `#E5E5EA` (Gray) |
| **Google (Dark)** | `#8AB4F8` (Muted Blue) | `#303134` (Dark Gray) |
| **Google (Light)** | `#1A73E8` (Strong Blue) | `#E8EAED` (Light Gray) |
| **Instagram** | `#E1306C` / Gradient | `#262626` (Dark) / `#EFEFEF` (Light) |

---

## 🔍 Detailed Component Colors

### 1. Preview Message Stripes (Quoted Messages)
The vertical accent bar found on the left side of a replied-to message.

*   **Sent Message (`isMe`):**
    *   **Stripe Color:** `rgba(255, 255, 255, 0.7)` (Semi-transparent white)
    *   **Sender Name:** `#FFFFFF` (Solid White)
    *   **Box Background:** `rgba(0, 0, 0, 0.12)` (Soft darken)
*   **Received Message (`!isMe`):**
    *   **Stripe Color:** `Brand Primary` (e.g., Spotify Green, Netflix Red)
    *   **Sender Name:** `Brand Primary`
    *   **Box Background (Dark Mode):** `rgba(255, 255, 255, 0.08)` (Soft lighten)
    *   **Box Background (Light Mode):** `rgba(0, 0, 0, 0.04)` (Ghostly dark)

### 2. Ticks & Read Receipts
*   **Read (Double Blue):** `#53bdeb` (Sky Blue)
*   **Delivered/Sent:** `textSecondary` color at `0.6` opacity.
*   **Pending (Clock):** `0.7` opacity (Standard Secondary color).

### 3. Audio Player
*   **Play/Pause Button:**
    *   Sent: `rgba(255, 255, 255, 1)`
    *   Received: Same as `textBubbleOther`
*   **Profile Picture Border:** `1.5px solid rgba(255, 255, 255, 0.15)`
*   **Duration Text:**
    *   Sent: `rgba(255, 255, 255, 0.9)`
    *   Received: Same as `textSecondary`

### 4. Interactive States
*   **Message Highlighting:** `rgba(255, 235, 59, 0.65)` (Yellow highlight for search/match)
*   **Selection Mode:** `rgba(66, 133, 244, 0.2)` (Blue overlay when selecting messages)
*   **Scrollbars:**
    *   Thumb (Dark): `rgba(255, 255, 255, 0.15)`
    *   Thumb (Light): `rgba(0, 0, 0, 0.15)`
    *   Hover: Up to `0.3` opacity.

---

## 🛠️ Global Variables (CSS-in-JS)
These are mapped via `styled-components` theme provider:
- `theme.colors.primary`: Brand accent color.
- `theme.colors.bubbleMe`: Background for sent messages.
- `theme.colors.bubbleOther`: Background for received messages.
- `theme.colors.textBubbleMe`: Text color for sent messages.
- `theme.colors.textBubbleOther`: Text color for received messages.
