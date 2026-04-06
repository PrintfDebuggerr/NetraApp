# Task: Refactor MVP scope and fix core flows for my React Native nofap app

You are working on my React Native / Expo app. I want you to act like a senior product-minded engineer.

## Main Goal
Refactor the app for MVP readiness.
Do NOT add random features.
Focus on:
1. fixing broken flows,
2. simplifying the product,
3. making the UI cleaner,
4. making the app fully Turkish.

---

## Product Direction
This app is a nofap / self-control / streak recovery app.
The MVP should feel simple, focused, and emotionally strong.
It should NOT feel bloated.

Core experience should be:
- Home
- Journal
- Panic button
- Achievements
- Leaderboard
- Community
- Basic profile/progress

---

## Important Product Decisions
For MVP:
- REMOVE or DISABLE AI Therapist for now
- REMOVE Teams section for now
- REMOVE unnecessary top icons in Community
- REMOVE or HIDE Internet Filter toggle for now unless there is a real implementation
- DEPRIORITIZE Invite Friends
- DEPRIORITIZE Profile Photo upload
- DEPRIORITIZE full Preferences / Help & Support implementation unless very lightweight

Reason:
I want a focused MVP, not feature bloat.

---

## What needs to be fixed

### 1. Full Turkish localization
The app is currently mostly in English.
I want the entire visible UI converted into Turkish.

Tasks:
- Find all hardcoded English strings
- Replace them with Turkish equivalents
- Centralize strings if possible into a constants/translations file
- Make wording natural and mobile-friendly
- Keep the tone short, clean, and not cringe

Examples:
- Home -> Ana Sayfa
- Journal -> Günlük
- Leaderboard -> Sıralama
- Community -> Topluluk
- Profile -> Profil
- Pledge -> Söz Ver
- Achievements -> Başarımlar / Rozetler (choose the better UX wording consistently)

---

### 2. Achievements system overhaul
Current achievements are weak and unfinished.

Tasks:
- Review the current achievement structure
- Create a clean achievement data model
- Give every achievement:
  - unique id
  - Turkish title
  - short Turkish description
  - appropriate icon name
  - clear unlock condition
- Improve naming consistency
- Make the achievement cards visually cleaner
- Ensure achievements render correctly in home/profile/progress areas

Do not use placeholder names like “Achievement 1”.
Make them meaningful.

---

### 3. Fix Pledge button flow
The “Söz Ver” button/page is not working properly.

Tasks:
- Find why the pledge flow is broken
- Fix navigation, state update, and UI feedback
- Make sure when user presses pledge:
  - action actually works
  - user gets visual confirmation
  - state persists if needed
- Improve UX text in Turkish

---

### 4. Remove AI Therapist from MVP
There is an AI therapist feature, but I am thinking of removing it.

Tasks:
- Analyze where AI Therapist exists in navigation, components, and state
- Remove or safely disable it
- Clean related dead code if possible
- Make sure removing it does not break navigation or layout

Do not replace it with another complex feature.

---

### 5. Turkish motivational quotes on home
The home page currently shows quotes, but they are not Turkish.

Tasks:
- Replace quotes with Turkish quotes/messages
- Keep them short, powerful, and non-cringe
- Make sure the quote component still works correctly
- Prefer app-specific tone over generic motivational nonsense

---

### 6. Fix Journal button/flow
The Journal button should work properly.

Tasks:
- Make sure journal navigation works
- Ensure the journal screen opens correctly
- If the screen is incomplete, create a very simple MVP version:
  - title
  - text input
  - save button
  - basic empty state / saved state
- Save behavior should be real if local storage already exists, otherwise implement a lightweight local solution

Do not overengineer this.

---

### 7. Panic button MVP implementation
I want the panic button to be emotionally impactful.

Desired idea:
When user presses panic button:
- open a focused full-screen view
- show front camera preview if feasible
- show a short message like:
  - “Bu sen değilsin.”
  - “5 saniye bekle. Geçecek.”
  - “Şimdi telefonu bırak.”
- show quick action buttons:
  - “Günlüğe Git”
  - “Ana Sayfaya Dön”

Tasks:
- Check current panic button implementation
- Build the simplest reliable MVP version
- If live front camera is too complex/problematic, create a fallback version with strong UI and messaging
- Keep design clean and serious, not dramatic in a cheesy way

---

## Library section

### 8. Fix leaderboard
Tasks:
- Make leaderboard screen functional
- Use mock/local/demo data if backend is not ready
- The screen must look complete and intentional
- Turkish labels only
- Avoid broken empty layouts

---

## Community section

### 9. Improve comment UI
The current community comment UI is not good.

Tasks:
- Redesign comment cards/items
- Make them cleaner, more modern, and easier to scan
- Improve spacing, hierarchy, avatar/text balance, and actions
- Keep implementation realistic for current codebase

### 10. Remove Teams and extra icons
Tasks:
- Remove/hide Teams section
- Remove unnecessary top icons if they do not serve the MVP
- Simplify the community screen

---

## Profile section

### 11. Progress card should work
Tasks:
- Fix “View Progress Card” button
- Create a clean dedicated progress card screen/component if needed
- Show real useful information:
  - streak
  - best streak
  - total check-ins / entries if available
  - achievements count
- Keep it simple and visually strong

### 12. Achievement icons in profile
Tasks:
- Make sure profile achievement visuals are consistent with the new achievement system
- Replace generic or bad icons

### 13. Profile extras
Only if easy and low-cost:
- profile photo upload
- invite friend button
Otherwise leave TODO comments and keep them out of MVP UI.

---

## Settings / support
### 14. App Preferences + Help & Support
Only create very lightweight placeholder screens if necessary for navigation completeness.
Do not build full complex systems.

A simple MVP is enough:
- App Preferences:
  - notifications placeholder
  - language info
  - version info
- Help & Support:
  - short FAQ
  - contact placeholder

If not needed, keep them hidden for now.

---

## Internet Filter note
There is a toggle for blocking porn websites.
This should NOT remain as a fake feature.

Tasks:
- Inspect current implementation
- If it is not a real and reliable implementation, remove/hide it from MVP
- Add a developer note explaining why it was removed
- Do not ship deceptive toggles

---

## What I want from you
I want you to:
1. inspect the current codebase,
2. identify all affected files,
3. propose an MVP cleanup plan,
4. then implement the changes step by step.

For your response:
- First give me a short audit:
  - what should stay
  - what should be removed
  - what is broken
- Then give me a step-by-step implementation plan
- Then start editing the code

Important:
- Avoid feature creep
- Prefer working flows over ambitious ideas
- Keep the design modern, minimal, and emotionally strong
- Keep the wording fully Turkish