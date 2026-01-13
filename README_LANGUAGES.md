# 🛠️ Languages & Styling Architecture

This project uses **JavaScript (ES6+)** with **React** for the frontend. The primary styling methodology is **CSS-in-JS** using the **Styled Components** library.

## 🎨 Styling Language: Styled Components

We do **not** use standard `.css` or `.scss` files for component styling. Instead, we use `styled-components`.

### Why this matters for code sharing
If you provide code snippets or reference designs, please use the following syntax patterns:

### 1. Component Definition
Styles are defined as React components using tagged template literals (backticks). Standard CSS syntax goes inside.

```javascript
import styled from 'styled-components';

// ✅ CORRECT
const MessageBubble = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
  max-width: 75%;
`;
```

### 2. Dynamic Theming (`props`)
We use a centralized theme. Do not hardcode colors if possible; access them via `props.theme`.

```javascript
// ✅ CORRECT
const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textPrimary};
`;

// ❌ AVOID (Hardcoded)
const Button = styled.button`
  background-color: #007AFF; 
`;
```

### 3. Nesting & Pseudo-selectors
Standard SCSS-like nesting is supported.

```javascript
const Wrapper = styled.div`
  &:hover {
    opacity: 0.8;
  }

  & > span {
    font-weight: bold;
  }
`;
```

## 📂 Key Style Files

- **Theme Definitions**: `client/src/theme/GlobalStyles.js`
  - Contains all color palettes (Netflix, Spotify, Apple, etc.) and layout variables.
- **Global Reset**: `client/src/theme/GlobalStyles.js` (exported as `GlobalStyles`)
- **Icons**: We use `react-icons` (e.g., `react-icons/bs`, `react-icons/io`).

## 📦 Tech Stack Summary

- **Frontend**: React 18
- **Styling**: styled-components
- **Icons**: react-icons
- **Backend**: Node.js / Express
- **Database**: MongoDB
