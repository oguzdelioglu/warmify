# Warmify - AI-Powered Gamified Fitness Coach 🦁

![Warmify Banner](./thumbnail.svg)

> **Submission for Google DeepMind - Vibe Code with Gemini 3 Pro**  
> *Turning fitness into an immersive RPG using Multimodal AI.*

## 🚀 Overview

**Warmify** is a futuristic, AI-powered Progressive Web App (PWA) that transforms your daily workout into an immersive Rhythm RPG. Built entirely using **Google AI Studio's Vibe Coding** workflow with Gemini 3 Pro, it solves the two biggest problems in home fitness: boredom and lack of professional feedback.

By combining **Gemini's Multimodal capabilities**, **MediaPipe** for computer vision, and **Three.js** for immersive visuals, Warmify solves the problem of boring, unsupervised home workouts.

---

## 📸 Gallery

| Dashboard | Workout Mode |
|-----------|--------------|
| ![Home](./screen_home.svg) | ![Workout](./screen_workout.svg) |

| Results & Rewards | Customization |
|-------------------|---------------|
| ![Results](./screen_results.svg) | ![Settings](./screen_settings.svg) |

---

## 🎥 Demo & Links

- **[🔴 Live App Link (Google AI Studio)](YOUR_AI_STUDIO_LINK_HERE)** *(Replace with your published link)*
- **[📺 Video Demo (YouTube)](YOUR_VIDEO_LINK_HERE)** *(Replace with your video link)*
- **[📄 Kaggle Writeup](YOUR_KAGGLE_WRITEUP_LINK)** *(Replace with your Kaggle link)*

---

## 💡 The Solution

Warmify turns your webcam into a sensor for a digital game using Multimodal AI.

1.  **See:** Using **MediaPipe**, it tracks 33 skeletal landmarks in real-time directly on your device (Privacy First).
2.  **Think:** **Gemini 3 Pro** acts as the Game Engine and Referee. It analyzes your movement quality, speed, and rhythm in real-time.
3.  **React:** Perform a "Perfect" rep, and your digital avatar glows neon green while you earn XP and Combos. Slouch or stop, and the system alerts you visually and audibly to correct your form.

---

## 🛠️ Tech Stack & Vibe Coding Journey

This project was built by leveraging **Gemini 3 Pro** in AI Studio's Build environment. The "Vibe Coding" process allowed for rapid prototyping of complex features.

> I prompted the vibe: *'Create a leveling system where users unlock new neon skins for their skeleton avatar based on XP'* and *'Design a Three.js background that reacts to workout intensity'*. Gemini generated the complex logic for the `LevelingSystem`, `RigOverlay`, and `GameLoop`, allowing for a polished, high-fidelity prototype in record time.

*   **Frontend:** React 19, TailwindCSS, Lucide React.
*   **AI & Logic:** 
    *   **Google GenAI SDK:** Utilizing the Multimodal Live API for real-time interaction context.
    *   **MediaPipe Pose:** Client-side skeletal tracking for privacy-first performance.
*   **Visuals:** 
    *   **Three.js:** Procedurally generated background environments that react to workout intensity.
    *   **Canvas API:** Drawing the "Rig Overlay" (Cyber, Mech, Spirit avatars) over the user's video feed.
*   **Deployment:** PWA (Progressive Web App) standards for native-like installation on iOS and Android.

---

## 🎮 Key Features

*   **Multimodal Coaching:** Real-time form correction using computer vision + GenAI logic.
*   **Gamification:** Level up from "Rookie" to "Legend", unlock badges, and customize your skeletal avatar (Cyber, Mech, Spirit).
*   **Immersive Tech:** Three.js reactive backgrounds and a custom Web Audio API synthesizer for dynamic SFX.
*   **Accessible:** Runs entirely in the browser (iOS/Android/Desktop) with no installation required.

---

## 📦 Installation (Local Dev)

While the app is designed to be Vibe Coded in AI Studio, you can run it locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/warmify.git

# Install dependencies
npm install

# Set up API Key
export API_KEY="your_gemini_api_key"

# Run the development server
npm run dev
```

---

## 🏆 Impact

Warmify makes elite personal training free, fun, and accessible to anyone with a camera, lowering the barrier to a healthy lifestyle through the power of AI.

*Built with ❤️ and ☕ using Google AI Studio.*