# Calendar App

[![CI](https://github.com/Rh96/react-native-calendar-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Rh96/react-native-calendar-app/actions/workflows/ci.yml)

A personal calendar for Android built with React Native and Firebase. It has month and day views, real-time sync that keeps working offline, side-by-side layout for overlapping events, and an optional biometric lock that never stores your password.

## Features

- **Month view**: 6-week grid with up to three colour dots per day and a highlighted today and selected day.
- **Day view**: hourly timeline (1 px per minute). Overlapping events sit side by side in columns; tap an empty hour to create an event there.
- **Create, edit, delete events**: title, optional description, date, start and end time, and one of eight colours. Moving an event to another day keeps its times, with validation.
- **Real-time and offline**: changes appear instantly and sync when you're back online. Failed saves are reported, never silently lost.
- **Private by design**: Firestore security rules allow each user to read and write only their own events.
- **Biometric lock** (optional): fingerprint or face required to open a saved session. Turned on from Profile.
- **Accessible**: every control has a role and spoken label for TalkBack (e.g. "Thursday, November 12, 2026, today, 2 events").
- **Light and dark theme** following the system setting.

<!--
## Screenshots

| Month | Day | New event | Lock |
|---|---|---|---|
| ![Month view](screenshots/month.png) | ![Day view](screenshots/day.png) | ![New event](screenshots/new-event.png) | ![Biometric lock](screenshots/lock.png) |
-->

## Tech stack

| Area | Choice |
|---|---|
| App | React Native 0.81 (bare CLI), React 19, TypeScript (strict) |
| Navigation | React Navigation 7 (bottom tabs) |
| Backend | Firebase Authentication (email/password) and Cloud Firestore |
| Device | `react-native-biometrics`, `react-native-keychain`, Material Design Icons |
| Testing | Jest and React Native Testing Library (153 app tests), Firebase emulator (22 security rules tests) |
| CI | GitHub Actions: typecheck, lint and test on every PR |

## Architecture and key decisions

```
Firebase Auth ──▶ AuthContext ──▶ App gate: session check → login → biometric lock → tabs
Firestore ──onSnapshot──▶ eventsApi ──▶ useEvents ──▶ Month / Day views ─▶ Event modal ─▶ writes
```

1. **A thin async data layer, no repository classes.** All Firestore access lives in one module of plain async functions ([`eventsApi.ts`](src/services/eventsApi.ts)). An earlier synchronous repository interface over an async database forced fire-and-forget writes, so save failures were silent. Firestore already provides caching, offline writes and live updates, so the extra layer added risk without benefit.
2. **Security rules are the real backend.** There is no server code. The app's `where('userId', '==', uid)` query is a convenience; [`firestore.rules`](firestore.rules) is what enforces ownership and validates every event (title length, `end > start`, colour format, no extra fields).
3. **Biometrics lock a session; they never store a password.** The lock gates the session Firebase already keeps on the device. Only a per-user "lock enabled" flag is stored in the keychain. It fails closed: if the setting can't be read or biometrics were removed, the app stays locked and offers a password sign-in instead.
4. **Instant UI, honest errors.** Saving closes the event modal immediately (Firestore shows the change locally and syncs later, even offline). If the server rejects the write, Firestore rolls it back and the user gets an alert naming the event.
5. **Impossible states made impossible.** The event modal's state is a single TypeScript discriminated union (`create` with a date | `edit` with an event). An earlier version used two optional props that could contradict each other, and events moved to the wrong day. Each bug fix started with a failing test.

## Getting started

### Prerequisites

- Node.js 22 (see [`.nvmrc`](.nvmrc)) and npm
- JDK 17, Android Studio with Android SDK 36 (minimum supported device: Android 7.0 / API 24)
- JDK 21 *only for the security rules tests*: the Firestore emulator requires it. Install it alongside 17; `npm run test:rules` finds it automatically, so your default Java (and Android builds) stays on 17
- A Firebase project (free tier is enough)

Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android first.

### 1. Install

```sh
npm install
```

### 2. Connect your Firebase project

1. In the [Firebase Console](https://console.firebase.google.com/), create a project and enable **Authentication → Email/Password** and **Cloud Firestore**.
2. Add an Android app with package name `com.calendarapp`, download `google-services.json` and place it at `android/app/google-services.json`. It's project-specific and kept out of git; see `android/app/google-services.json.example` for the shape.
3. Deploy the security rules:

   ```sh
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-firebase-project-id>
   ```

   Your project ID is `project_info.project_id` in `google-services.json`.

### 3. Run on Android

Start Metro, then build and install the app on an emulator or a USB-connected device with USB debugging enabled:

```sh
npm start
npm run android   # in a second terminal
```

<details>
<summary>Device not showing up?</summary>

- Run `adb devices`. If the device shows as `unauthorized`, accept the USB debugging prompt on the phone.
- Try another cable or port, or revoke USB debugging authorizations in Developer Options and reconnect.
- Make sure Android SDK Platform Tools are on your `PATH`.

</details>

## Scripts and testing

| Command | What it does |
|---|---|
| `npm test` | Jest test suite (app) |
| `npm run test:rules` | Firestore security rules tests in the local emulator (needs JDK 21) |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm start` / `npm run android` | Metro / build and run on Android |

The **security rules** have their own suite ([`rules-tests/`](rules-tests/firestore.rules.test.ts)) that runs the real `firestore.rules` in the Firestore emulator with an offline `demo-` project. It covers ownership of reads, writes and deletes, the "rules are not filters" query behaviour, and every validation (title, dates, colour, unknown fields, ownership transfer, merged updates).

The app tests cover the pure calendar logic (overlap columns, the month grid including leap years and daylight-saving changes, validation), hooks (events, calendar state, biometric lock), and full user flows through the real app with only native modules mocked. They query the UI by accessible role and name, the way a screen reader sees it.

Test setup worth knowing:

- Jest runs in a fixed time zone with daylight saving (`Europe/Berlin`), so date tests behave the same locally and in CI (which runs in UTC).
- Any unexpected `console.error`/`console.warn` fails the test, so React warnings can't pile up unnoticed.

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs two jobs on every pull request and push to `main` and `dev`: typecheck, lint and app tests, and the security rules tests against the emulator. No secrets are needed.

## Project structure

```
App.tsx                  Providers and the app gate (session → login → lock → tabs)
src/
  components/            Screens and UI: MonthView, DayView, EventModal, Auth, Lock, Profile, shared
  contexts/              AuthContext (session, sign-in/up/out, friendly errors)
  hooks/                 useEvents, useCalendar, useBiometricLock, useLockSetting
  services/              eventsApi (Firestore), biometricLock (keychain + prompt), AuthService
  utils/                 Pure logic: dateHelpers, eventLayout, validation, authErrors
  theme/                 Light/dark tokens
__tests__/               Tests mirroring src/
__mocks__/               Firebase mocks
firestore.rules          Security rules (deployed to Firebase)
```

## Status

- **Android**: built and tested.
- **iOS**: not tested yet. Firebase, biometrics and icon fonts need iOS-specific setup (`GoogleService-Info.plist`, `pod install`, `npx rnvi-update-plist package.json ios/CalendarApp/Info.plist`).

## License

[MIT](LICENSE) © 2025–2026 Rh96
