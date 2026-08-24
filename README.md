# ⚡ AuraHabit — Daily Habit Tracker & Consistency Platform

![AuraHabit Banner](https://img.shields.io/badge/AuraHabit-v1.0.0-6366f1?style=for-the-badge&logo=appveyor)
![License](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-10b981?style=for-the-badge)

**AuraHabit** is a feature-rich, dark glassmorphic daily habit tracker built with modern HTML5, CSS3, JavaScript ES modules, Web Audio API synthesis, and real-time multi-device cloud synchronization.

---

## ✨ Features

- **⚡ Hero Progress Ring & Daily Dashboard**: Real-time completion SVG ring, date greetings, and motivational quotes.
- **📅 Week Calendar Navigator**: Interactive 7-day strip (Mon–Sun) to inspect and log backdated entries.
- **💧 Boolean, Numeric & Duration Trackers**: Support for checkmarks, water/step counters, and focus timers.
- **⏱️ Deep Focus Chamber (Pomodoro)**: Custom focus clock with **Ambient Sound Machine** (432Hz Binaural Meditation Drone & White Noise generator).
- **📲 Real-Time Multi-Device Sync**: Sync Room Code system (`AURA-XXXX`) pairing web browsers, mobile phones, and Android APKs live.
- **📝 Daily Reflection & Mood Journal**: Track daily mood (Energized ⚡, Happy 😊, Calm 🧘, Neutral 😐, Low 🌧️) and log reflections.
- **📊 28-Day Consistency Heatmap Grid**: GitHub-style activity grid visualizing habit consistency over time.
- **🏆 Gamification & Milestone Badges**: Earn XP based on habit difficulty (*Easy* +10 XP, *Medium* +25 XP, *Hard* +50 XP), level up, and unlock achievements.
- **🎨 Aesthetic Streak Share Cards**: Downloadable PNG summary card generator for social media sharing.
- **🔊 Web Audio Synthesizer**: Zero-dependency UI sound feedback (clicks, C-Major chords, timer alarms, unlock fanfares).

---

## 📁 Repository Structure

```
habit-tracker/
├── index.html       # Main HTML SPA structure with navigation tabs
├── styles.css       # Master Glassmorphism design system & CSS variables
├── app.js           # Main application controller, SPA router & live sync
├── storage.js       # Data engine, localStorage persistence & streak logic
├── audio.js         # Web Audio API sound synthesizer & ambient sound machine
├── effects.js       # Canvas confetti particle physics & floating XP toasts
├── manifest.json    # Progressive Web App (PWA) manifest
└── README.md        # Documentation
```

---

## 🚀 Quick Start

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/aurahabit.git
   cd aurahabit
   ```

2. Open `index.html` in any web browser, or serve with your favorite local server:
   ```bash
   npx serve .
   ```

---

## 📄 License

Distributed under the MIT License. Built with ❤️ for daily consistency and focus.
