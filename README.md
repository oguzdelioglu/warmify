# Warmify - AI-Powered Gamified Fitness Coach 🦁

![Warmify Banner](https://placehold.co/1200x400/0f172a/6366f1?text=Warmify:+Vibe+Coded+with+Gemini+3+Pro)

> **Submission for Google DeepMind - Vibe Code with Gemini 3 Pro**  
> *Turning fitness into an immersive RPG using Multimodal AI.*

## 🚀 Overview

**Warmify** is a Progressive Web App (PWA) that transforms your daily workout into an interactive game. Built entirely using **Google AI Studio's Vibe Coding** capabilities, Warmify utilizes your device's camera to analyze movement in real-time, providing instant feedback, counting reps, and awarding XP for good form.

By combining **Gemini's Multimodal capabilities**, **MediaPipe** for computer vision, and **Three.js** for immersive visuals, Warmify solves the problem of boring, unsupervised home workouts.

---

## 🎥 Demo & Links

- **[🔴 Live App Link (Google AI Studio)](YOUR_AI_STUDIO_LINK_HERE)** *(Paste your published link here)*
- **[📺 Video Demo (YouTube)](YOUR_VIDEO_LINK_HERE)** *(Paste your video link here)*
- **[📄 Kaggle Writeup](YOUR_KAGGLE_WRITEUP_LINK)**

---

## 💡 The Problem & Solution

### The Friction
Home workouts suffer from two main issues:
1.  **Lack of Feedback:** Am I doing this squat correctly? Am I going to hurt myself?
2.  **Boredom:** Counting reps is tedious, and motivation fades quickly without a gym environment.

### The Warmify Solution
Warmify acts as a **Digital Personal Trainer**:
*   **See:** It tracks 33 body landmarks in real-time to analyze posture.
*   **Think:** It uses Gemini logic to determine if a rep is "Perfect", "Good", or a "Miss".
*   **Speak:** It provides encouraging audio feedback and sound effects.
*   **Reward:** It gamifies the experience with RPG elements (Leveling, Skins, Archetypes).

---

## 🛠️ Tech Stack & Vibe Coding Journey

This project was built by leveraging **Gemini 3 Pro** in AI Studio's Build environment. The "Vibe Coding" process allowed for rapid prototyping of complex features:

*   **Frontend:** React 19, TailwindCSS, Lucide React.
*   **AI & Logic:** 
    *   **Google GenAI SDK:** Utilizing the Multimodal Live API for real-time interaction context.
    *   **MediaPipe Pose:** Client-side skeletal tracking for privacy-first performance.
*   **Visuals:** 
    *   **Three.js:** Procedurally generated background environments that react to workout intensity.
    *   **Canvas API:** Drawing the "Rig Overlay" (Cyber, Mech, Spirit avatars) over the user's video feed.
*   **Deployment:** PWA (Progressive Web App) standards for native-like installation on iOS and Android.

### How Gemini 3 Pro Helped
> "I simply prompted: *'Create a leveling system where users unlock new neon skins for their skeleton avatar based on XP,'* and Gemini generated the entire `LevelingSystem.tsx` and `RigOverlay.tsx` logic, including the canvas drawing mathematics."

---

## 🎮 Key Features

### 1. Real-Time Form Correction (The "Eyes")
Using MediaPipe and custom logic, Warmify overlays a digital skeleton onto the user.
*   **Visual Feedback:** The skeleton glows **Green** on perfect hits and shakes **Red** on misses.
*   **Archetypes:** Users can switch between different visual styles (Cyber, Stickman, Mech, Alien, Spirit).

### 2. Immersive Audio-Visuals
*   **Three.js Core:** A 3D background reacts to the user's movement intensity.
*   **Sound Engine:** A custom synthesizer (Web Audio API) generates dynamic SFX for hits, combos, and level-ups without needing external MP3 assets.

### 3. Gamification Loop
*   **XP & Leveling:** Earn XP for every perfect rep.
*   **Streak System:** Daily login bonuses.
*   **Unlockables:** Unlock new badges (e.g., "Ninja", "Tank") and skins (Colorways) as you progress.
*   **Leaderboard:** Compare your "Agent Level" with the global elite.

### 4. Native Mobile Experience
Designed as a PWA with `manifest.json` and iOS meta tags. It features:
*   Portrait orientation lock.
*   Haptic feedback (visual/audio).
*   No-install instant play.

---

## 🔮 Future Roadmap

*   **Gemini Live Voice Coaching:** Fully integrating the audio-in/audio-out capabilities to allow users to ask, *"How was my form?"* and get a verbal response.
*   **Multiplayer Battles:** Real-time 1v1 pose matching battles.
*   **Dietary Integration:** Snapping a photo of a meal for Gemini to analyze calories and adjust the workout difficulty.

---

## 📦 Installation (Local Dev)

While the app is hosted on AI Studio, you can run it locally:

```bash
# Clone the repository
git clone https://github.com/oguzdelioglu/warmify.git

# Install dependencies
npm install

# Set up API Key
export API_KEY="your_gemini_api_key"

# Run the development server
npm run dev
```

---

## 🏆 Impact

**Health:** Warmify lowers the barrier to entry for fitness by making it free, accessible, and genuinely fun.
**Accessibility:** It works on any device with a webcam, bringing advanced PT coaching to anyone, anywhere.

*Built with ❤️ and ☕ using Google AI Studio.*
