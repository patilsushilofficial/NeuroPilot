# NeuroPilot 🧠
### The Definitive Neuro-Inclusive ADHD Companion App

> Built entirely on clinical ADHD research. Fully offline. Zero data collection.

---

## Overview

NeuroPilot is a production-ready React Native (Expo) app for ADHD management, designed by applying neurobiological research into every UX and engineering decision. It works completely offline — all data is stored on the device using MMKV (synchronous, JSI-backed key/value storage).

**Target:** Adults & Children (mode-selectable during onboarding)  
**Platform:** Android (Play Store) & iOS  
**Architecture:** Expo Managed Workflow + EAS Build

---

## Features

| Feature | ADHD Principle Applied |
|---|---|
| ⚡ Quick Capture | Sub-60s task entry — prevents "out of sight, out of mind" |
| ⏱️ Visual Circular Timer | Makes time tangible (counter to time blindness) |
| 🎯 5 Focus Presets | ADHD Starter (10m) → Flow State (90m) |
| 🔥 Habit Streaks | Dopamine reward loop via visual chain |
| ✅ Animated Checkboxes | Haptic + visual completion feedback |
| 🏆 XP + Level System | Variable reward schedule combats reward deficiency |
| 🥇 20+ Achievements | Long-term motivation through milestone celebration |
| 📊 Weekly Charts | Visual progress tracking |
| 🌙 Dark Mode (Default) | Reduces sensory overload |
| 📱 Progressive Disclosure | Only shows complexity when needed |

---

## Tech Stack

```
React Native 0.74    → Cross-platform native performance
Expo SDK 51          → Managed workflow, easy EAS builds
TypeScript           → Strict typing throughout
Zustand + Persist    → Lightweight state with MMKV (react-native-mmkv)
React Navigation 6   → Native stack + custom bottom tabs
react-native-svg     → Circular timer, progress charts
expo-haptics         → Multi-sensory task completion feedback
expo-notifications   → Local-only reminders (no server)
react-native-reanimated 3 → 60fps animations
date-fns             → Lightweight date utilities
```

---

## Folder Structure

```
NeuroPilot/
├── App.tsx                     # Entry point
├── app.json                    # Expo config + Android permissions
├── package.json
├── tsconfig.json               # Path aliases (@store, @components, etc.)
└── src/
    ├── theme/                  # Neuro-inclusive color/type/spacing system
    │   ├── colors.ts           # Dark + light semantic tokens
    │   ├── typography.ts       # Accessible type scale
    │   ├── spacing.ts          # 8pt grid + border radii + shadows
    │   └── index.ts
    ├── types/
    │   └── index.ts            # All TypeScript interfaces
    ├── constants/
    │   ├── achievements.ts     # 20+ achievement definitions
    │   └── focusPresets.ts     # Timer presets, XP logic, quotes
    ├── store/
    │   ├── index.ts            # Zustand root store + selectors
    │   └── slices/
    │       ├── tasksSlice.ts
    │       ├── habitsSlice.ts
    │       ├── focusSlice.ts
    │       ├── gamificationSlice.ts
    │       └── settingsSlice.ts
    ├── utils/
    │   ├── dateUtils.ts        # ADHD-friendly date formatting
    │   ├── notifications.ts    # Local notification scheduling
    ├── hooks/
    │   ├── useHaptics.ts       # Centralized haptic feedback
    │   └── useAppTheme.ts      # Theme switcher hook
    ├── components/
    │   ├── common/             # Button, Card, Badge, ProgressBar, etc.
    │   ├── tasks/              # TaskCard, QuickCapture
    │   ├── focus/              # CircularTimer
    │   └── habits/             # HabitCard
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   ├── TabNavigator.tsx    # Custom bottom tab bar
    │   └── stacks/
    └── screens/
        ├── onboarding/         # 4-step wizard
        ├── home/               # Dashboard
        ├── tasks/              # Task list + Add/Edit
        ├── focus/              # Pomodoro timer
        ├── habits/             # Habit tracker + Add/Edit
        ├── progress/           # XP, stats, achievements
        └── settings/           # Preferences
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Run on Android (Expo Go)
npx expo start --android

# 3. Run on iOS
npx expo start --ios
```

### Build for Play Store

```bash
# 1. Login to Expo
eas login

# 2. Configure your project
eas build:configure

# 3. Create a preview APK (for testing)
eas build --platform android --profile preview

# 4. Create a production AAB (for Play Store)
eas build --platform android --profile production

# 5. Submit to Play Store
eas submit --platform android
```

---

## Publishing to Play Store — Checklist

- [ ] Replace `app.json` → `"projectId"` with your real EAS project ID
- [ ] Replace `"package": "com.neuropilot.app"` with your unique package name
- [ ] Create app assets:
  - `assets/icon.png` — 1024×1024px
  - `assets/splash.png` — 2048×2048px
  - `assets/adaptive-icon.png` — 1024×1024px (Android)
  - `assets/notification-icon.png` — 96×96px white on transparent
- [ ] Set up Google Play Console account
- [ ] Run `eas build --platform android --profile production`
- [ ] Submit AAB via `eas submit` or manually upload to Play Console
- [ ] Add Play Store listing: screenshots, description, category (Health & Fitness)
- [ ] Set content rating (Everyone / Teen depending on child mode)

---

## ADHD UX Design Principles Applied

This app was engineered against the research paper's specifications:

1. **Reward Deficiency** → XP rewards, achievement badges, haptic celebrations
2. **Time Blindness** → Circular countdown timer (time made visible)
3. **Executive Dysfunction** → Progressive disclosure forms, QuickCapture
4. **Cognitive Overload** → Flat navigation, ample whitespace, chunked information
5. **Working Memory Gaps** → External persistent memory (tasks/habits always visible)
6. **Hyperfocus** → Haptic phase-transition nudges
7. **Sensory Sensitivity** → Muted color palette, optional reduced motion
8. **Interest-Based Nervous System** → Gamification, variable rewards, streaks

---

## Offline-First Architecture

Every byte of data lives on the device:

- **State:** Zustand with MMKV persistence
- **Notifications:** expo-notifications (local scheduling, no server)
- **No network calls:** Zero API requests, zero analytics, zero tracking
- **No auth required:** Optional profile, no email/password

---

## License

MIT — Free to use, modify, and publish.

Built with 💜 for the neurodivergent community.
