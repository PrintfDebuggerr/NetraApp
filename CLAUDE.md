# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start Expo dev server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

There is no test suite in this project.

## Environment Setup

Copy `.env.example` to `.env` and fill in real values. All Firebase config and the Resend API key are loaded via `EXPO_PUBLIC_*` env vars (Expo reads these automatically). Google OAuth client IDs go in `app.json` under `expo.extra` — they are currently empty/not implemented.

## Architecture

**Entry point:** `index.js` → `App.js`

`App.js` wraps everything in `AuthProvider` → `StreakProvider` → `NavigationContainer`. The inner `AppContent` component checks `user` from `useAuth()` and renders either `AuthStack` (unauthenticated) or `MainTabs` (authenticated).

### Navigation Structure

```
AuthStack:          Login → Register → Verification
MainTabs (5 tabs):
  Home    → HomeStack    (HomeScreen → PledgeScreen)
  Stats   → StatsScreen
  Library → LibraryStack (LibraryScreen → MeditationScreen)
  Feed    → FeedStack    (FeedScreen → PostDetailScreen → CommentsScreen)
  Profile → ProfileStack (ProfileScreen → SettingsScreen → AchievementsScreen)
```

### State Management

Two React Contexts:

- **`AuthContext`** (`src/contexts/AuthContext.js`): Firebase Auth state + all auth operations (register, login, logout, email verification, password reset, Google OAuth stub). Exposes `user` and `loading`.
- **`StreakContext`** (`src/contexts/StreakContext.js`): Streak data with dual persistence (AsyncStorage + Firestore). Exposes `streakData`, `timer` (real-time countdown), `brainRewiring` (percentage to 90 days), `resetStreak`, `editStreak(days)`, `refreshStreak`, `syncWithFirestore`.

### Registration Flow (Critical)

1. `register()` → `createUserWithEmailAndPassword` (Firebase Auth only — password never goes to Firestore)
2. `saveVerificationCode()` → writes to `emailVerifications/{email}` in Firestore
3. Send code via Resend API (`emailService.js`)
4. User enters code in `VerificationScreen` → `verifyCode()` checks expiry (5 min) + attempts (max 3)
5. `completeRegistration()` → creates `users/{uid}` and `streaks/{uid}` docs → sets `user` state → navigates to `MainTabs`

**Login with unverified email** returns `{ error: 'EMAIL_NOT_VERIFIED', email }` — the login screen must navigate to `VerificationScreen` on this specific error code.

### Firestore Collections

| Collection | Doc ID | Notes |
|---|---|---|
| `users` | `{uid}` | `emailVerified: true` required for auth gate |
| `streaks` | `{uid}` | Streak counters + `startDate` for timer |
| `emailVerifications` | `{email}` | Temp; `verified` flag + `expiresAt` |
| `posts` | auto | `userId`, `likes`, `likedBy[]`, `commentCount` |
| `comments` | auto | `userId`, `postId` |
| `pledges` | `{uid}` | User's personal pledge text |

Security rules are in `firestore.rules` — deploy with `firebase deploy --only firestore:rules`.

### Services

- **`emailService.js`**: Sends verification emails via Resend API (`EXPO_PUBLIC_RESEND_API_KEY`)
- **`verificationService.js`**: CRUD for `emailVerifications` collection; `isEmailVerified(userId)` checks `users/{uid}.emailVerified`
- **`notificationService.js`**: `expo-notifications` — daily 20:00 reminder + milestone push notifications at streaks [1, 3, 7, 14, 30, 60, 90]

### Streak Persistence Strategy

`streakManager.js` uses AsyncStorage as primary cache (`@quitter_streak` key) with Firestore as backup. On load: try AsyncStorage → fallback Firestore → create new. `checkAndUpdateStreak()` auto-increments day count or resets streak if >1 day gap (auto-relapse detection).

### Design System

Dark theme throughout. Primary accent: `#0df2a6` (teal/green). Background: `#0a0e27` / `#1a1a2e`. All screens use `StyleSheet.create` with inline styles — no shared style file. Icons from `@expo/vector-icons` (Ionicons + MaterialCommunityIcons + Feather).

## Known Incomplete Features

- Google OAuth: client IDs in `app.json` are empty strings
- Meditation/Breathing/AI Therapist screens: UI stub only, no functionality
- Leaderboard: no implementation
