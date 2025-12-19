# Warmify - AI-Powered Gamified Fitness RPG 🦁

![Warmify Banner](./thumbnail.svg)

> **Transform your daily workout into an immersive RPG.**  
> Warmify uses your device's camera and advanced AI to track your movements, count your reps, and correct your form in real-time—all while you earn XP, unlock skins, and climb the global leaderboard.

---

## � App Store Metadata

### 📝 General Information
- **App Name:** Warmify: AI Fitness RPG
- **Subtitle:** Gamified Home Workouts & Form
- **Copyright:** © 2025 Warmify
- **Category:** Health & Fitness / Gaming

### � Keywords (ASO)
`fitness game`, `ai workout`, `posture corrector`, `gamification`, `home gym`, `rpg fitness`, `squat tracker`, `exercise game`, `health rpg`, `interactive fitness`, `body tracking`, `calisthenics`, `workout tracker`, `flexibility test`

### � Promotional Text
Turn your fitness routine into a game! Warmify uses AI to count your reps and correct your form. No equipment needed—just your camera. Level up your real-life stats today.

### 📜 Description
**Bored of static workout videos? Welcome to the future of fitness.**

Warmify is the first AI-powered fitness app that plays like a video game. Using advanced computer vision and Google Gemini AI, Warmify sees your movements in real-time, providing instant feedback on your form while you earn rewards.

**WHY WARMIFY?**

🎮 **Gamified Fitness:** Earn XP for every squat, lunge, and jumping jack. Level up from "Rookie" to "Legend" and unlock exclusive neon avatars (Cyber, Mech, Spirit).
🤖 **AI Form Coach:** Our advanced AI analyzes your posture 30 times per second. It visually alerts you if you're slouching or not squatting low enough.
🌍 **Global Leaderboards:** Compete with friends and users worldwide. Climb the ranks to become the #1 fitness agent.
🧘 **Flexibility Tracker:** Track your range of motion (ROM) progress for shoulders, hips, and spine with our specialized computer vision tool.
🏆 **Daily Missions:** Keep your streak alive with generated daily quests tailored to your sport style (Football, Runner, Cyclist, Desk Worker, etc.).

**FEATURES:**
- **Real-Time Body Tracking:** Privacy-first, on-device tracking.
- **5 Sport Modes:** Tailored warmups for Football, Running, Cycling, Rugby, and Desk Life.
- **11+ Languages:** English, Turkish, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese.
- **Dynamic 3D Avatars:** See your digital twin mirror your moves with cool particle effects.
- **Pro Membership:** Unlock unlimited workouts, advanced flexibility insights, and premium skins.

**No equipment required. Your body is the controller.**

---

## 🛠️ Technical Stack

Warmify is a cutting-edge hybrid application built with:

- **Core:** React 19, TypeScript, Vite
- **UI:** TailwindCSS v4, Lucide React
- **Mobile Native:** Capacitor v8 (iOS & Android)
- **AI & Vision:** 
    - **MediaPipe Pose:** Real-time skeletal tracking.
    - **Google Gemini:** Logic and feedback analysis.
- **Graphics:** Three.js (Reactive environments), Custom Canvas rendering.
- **Monetization:** Adapty (In-App Purchases).
- **Backend:** Supabase (Leaderboards).

---

## 📦 Installation & Development

### Prerequisites
- Node.js (v18+)
- Xcode (for iOS) / Android Studio (for Android)
- CocoaPods (for iOS dependencies)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/oguzdelioglu/warmify.git

# 2. Install dependencies
npm install

# 3. Setup Environment Variables (.env)
cp .env.example .env
# Add API Keys: VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# 4. Run Locally (Web)
npm run dev
```

### Building for Mobile

**iOS:**
```bash
# Build web assets and sync native project
npm run build:ios

# This command automatically:
# 1. Builds the Vite project
# 2. Syncs Capacitor plugins/assets
# 3. Updates Info.plist permissions
# 4. Injects App Tracking Transparency (ATT) logic
# 5. Opens Xcode workspace
```

**Android:**
```bash
npm run build:android
```

---

## 🔒 Privacy & Permissions

Warmify requires the following permissions to function:
- **Camera:** To track body movements (Data is processed locally on-device).
- **Microphone:** For voice commands (optional).
- **Tracking (iOS):** To provide personalized ads and improve app performance.
- **Notifications:** For daily workout reminders (optional).

---

*Built with ❤️ by Oguz Delioglu.*