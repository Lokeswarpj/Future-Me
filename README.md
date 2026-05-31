# 🚀 FutureMe | Meet Your Future Self

**Live Demo URL:** 👉 **[https://future-me-five.vercel.app](https://future-me-five.vercel.app)**

**FutureMe** is a premium, high-fidelity AI-powered personal growth and reflection application. It allows users to reflect on their current struggles, goals, fears, and timelines. Using the **Google Gemini 2.5 Flash** model, it establishes an emotional, intelligent, and highly personalized portal with their "Future Self," generating actionable advice, warning signs, daily mantras, and unlocking a real-time, interactive, contextual temporal dialogue.

Designed with an ultra-premium, responsive **Apple-style Glassmorphism UI**, smooth scroll triggers, and delightful glowing effects, this app is fully optimized for spectacular live demonstrations and presentations.

---

## 📂 Project Structure

```
futureme/
├── frontend/
│   ├── index.html     # High-fidelity Apple-style layout & interactive DOM states
│   ├── style.css      # Core Apple Dark styling, orbs, animations, and custom scrollbars
│   └── script.js      # Unified controller: dynamic loading sequences, AJAX network layer, chat state
├── backend/
│   ├── server.js      # Node.js + Express web API (CORS, serving frontend assets, calling Gemini)
│   ├── package.json   # Backend dependencies & watch runners
│   └── .env.example   # Environment key template
└── README.md          # Comprehensive setup guide
```

---

## ⚡ Quick Start & Installation

To run FutureMe locally, follow these simple steps:

### 1. Clone or Navigate to Backend
Open your terminal and navigate to the backend folder:
```bash
cd backend
```

### 2. Install Dependencies
Install all required Node modules:
```bash
npm install
```

### 3. Setup Gemini API Key
Create a `.env` file by copying the example template:
```bash
cp .env.example .env
```
Open `.env` and replace the placeholder value with your real Google Gemini API Key:
```env
GEMINI_API_KEY=AIzaSyYourActualKeyHere
PORT=5000
```
> **Note:** The backend has been programmed to protect your API key. It is *never* exposed to the frontend JavaScript.

### 4. Run the Application
Start the backend development watch server:
```bash
npm run dev
```
Alternatively, for standard production execution:
```bash
npm start
```

### 5. Open the Frontend
Once the server starts successfully, simply open your browser and navigate to:
**👉 [http://localhost:5000](http://localhost:5000)**

*The Express backend is programmed to automatically serve your static frontend files directly from port 5000, creating a unified single-command deployment!*

---

## 🛠️ API Routes Overview

The backend exposes two POST endpoints:

### 1. `POST /api/generate-futureme`
Receives personal reflection factors and generates a structured, tone-calibrated response from the user's Future Self.
- **Request Body:**
  ```json
  {
    "name": "Lokeswar",
    "age": "19",
    "goal": "Build a successful AI startup",
    "struggle": "Lack of consistency",
    "oneYearVision": "Running a profitable AI company",
    "tone": "brutal"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "message": "...",
      "futureIdentity": "...",
      "nextMoves": ["...", "...", "..."],
      "habit": "...",
      "warning": "...",
      "mantra": "..."
    }
  }
  ```

### 2. `POST /api/chat-futureme`
Handles active, contextual, multi-turn follow-up conversations with the generated Future Self.
- **Request Body:**
  ```json
  {
    "userProfile": {
      "name": "Lokeswar",
      "age": "19",
      "goal": "Build a successful AI startup",
      "struggle": "Lack of consistency",
      "oneYearVision": "Running a profitable AI company",
      "tone": "brutal"
    },
    "chatHistory": [
      { "role": "user", "message": "Will I actually make it?" },
      { "role": "futureme", "message": "Only if your actions match your dreams." }
    ],
    "question": "What should I focus on this week?"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "reply": "..."
  }
  ```

---

## 🌟 Demo Key Highlights
- **Visual WOW Factor:** The glassmorphic forms and slow-moving orbital background glow.
- **Micro-Interactions:** Custom dynamic loading titles ("Establishing timeline bridge...", "Analyzing psychological friction...") that cycle to capture the audience's attention during generation.
- **Clean separation:** Separating index.html, style.css, and script.js guarantees professional production-grade files.
- **Copy-to-Clipboard Engine:** Copies a beautiful, clean-text dashboard report in one click.
- **Adaptive Tones:** Try "Brutally Honest" for zero-excuses execution style, or "Calm Mentor" for strategic wisdom, and watch Gemini change its entire vocabulary!
