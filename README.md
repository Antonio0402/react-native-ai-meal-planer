# FreshPlan — AI-Powered Meal Planner & Smart Grocery Assistant

FreshPlan is a cross-platform mobile and web application designed to reduce household food waste and streamline daily meal preparation. By allowing users to capture or upload ingredient photos, FreshPlan detects ingredients, accommodates dietary allergies, recommends customized recipes, generates a balanced 21-meal weekly schedule, and automatically compiles smart grocery shopping lists.

---

## Key Features

- **Ingredient Scanning & Detection**: Capture or select ingredient photos using the camera; images are preprocessed and automatically analyzed to detect available items in your pantry and refrigerator.
- **Pantry & Inventory Management**: Track inventory items with precise quantities, units (e.g., kg, g, l, ml, pieces), and expiration dates.
- **Dietary & Allergy Management**: Configure dietary restrictions and food allergies (seafood, nuts, dairy, gluten, eggs, etc.) to ensure recipes and meal plans are strictly safe.
- **Personalized Recipe Suggestions**: Recommends dishes matching ingredients currently in stock, scaled to target serving sizes, with clear step-by-step cooking instructions.
- **21-Meal Weekly Planner**: Automatically generates or customizes meal slots (Breakfast, Lunch, Dinner) across all 7 days of the week.
- **Smart Grocery List**: Compares weekly meal requirements with active pantry stock to compute exact shortages, automatically performing unit conversions (kg ↔ g, l ↔ ml).
- **Dual Runtime Modes**:
  - **Live Mode** (`EXPO_PUBLIC_IS_MOCKING=false`): Communicates with the FastAPI backend, utilizing Supabase JWT authentication, PostgreSQL cloud storage, and Google Gemini AI models.
  - **Mock / Offline Mode** (`EXPO_PUBLIC_IS_MOCKING=true`): Fully functional self-contained mode using local sample data and algorithms in `src/services/mock-api.ts` with AsyncStorage persistence.

---

## System Architecture & Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (v0.86) with [Expo SDK 57](https://expo.dev/)
- **Navigation**: [Expo Router v57](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type-checking)
- **State & Storage**: React Context providers (`AuthProvider`, `AppDataProvider`) with `@react-native-async-storage/async-storage` offline caching
- **Backend Service**: [FastAPI](https://fastapi.tiangolo.com/) (Python) REST API with OpenAPI v3 schema validation
- **Authentication & Database**: [Supabase](https://supabase.com/) Auth (JWT) & PostgreSQL
- **Typography & Theme**: Inter & Lora fonts via `@expo-google-fonts`

---

## Directory Structure

```text
fresh-plan/
├── assets/                 # App icons, splash screens, and image assets
├── src/
│   ├── app/                # Expo Router routes & layouts
│   │   ├── (app)/          # Authenticated app tree
│   │   │   ├── (tabs)/     # Bottom tabs (Inventory, Recipes, Week, Shopping)
│   │   │   ├── scan.tsx    # Ingredient photo capture & confirmation flow
│   │   │   └── welcome.tsx # Onboarding screen
│   │   ├── login.tsx       # Authentication screen (Login / Sign Up)
│   │   └── _layout.tsx     # Root application layout & font loading
│   ├── components/         # Reusable UI widgets (Buttons, Cards, Inputs, AllergyEditor)
│   ├── hooks/              # Custom React hooks (useApiQuery with AbortController)
│   ├── providers/          # Global application providers (AuthProvider, AppDataProvider)
│   ├── screens/            # Screen view implementations
│   ├── services/           # Network layer, API clients, schema validators, mock API
│   ├── state.ts            # State synchronization, optimistic updates, and drafts
│   ├── theme.ts            # Design tokens, color palette, spacing, and typography
│   └── types.ts            # Data models and domain TypeScript interfaces
├── app.json                # Expo application manifest & configuration
├── eslint.config.js        # ESLint flat configuration
├── package.json            # Node.js dependencies and run scripts
├── tsconfig.json           # TypeScript configuration
└── .env.example            # Environment variables template
```

---

## Getting Started

### Prerequisites

- **Node.js**: version 20.x or higher
- **Package Manager**: `npm` or `yarn`
- **Mobile Environment (Optional)**:
  - Expo Go app on iOS / Android device, or
  - Android Studio (for Android Emulator / Native APK builds)

### 1. Installation

Clone the repository and install dependencies:

```bash
cd fresh-plan
npm install
```

### 2. Environment Configuration

Copy `.env.example` to create `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:

```dotenv
# Set to 'true' to run fully offline with mock data, or 'false' for live backend
EXPO_PUBLIC_IS_MOCKING=false

# FastAPI backend URL (default: http://127.0.0.1:8000)
# When testing on physical devices, Expo automatically resolves your development machine's LAN IP.
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000

# Supabase project credentials (required when EXPO_PUBLIC_IS_MOCKING=false)
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

---

## Running the Application

### Development Server

Start the Expo Metro bundler:

```bash
npx expo start
```

From the terminal:
- Press **`w`** to open the web version in your default browser.
- Scan the displayed QR code with the **Expo Go** app on your physical mobile device.
- Press **`a`** to launch on an active Android Emulator.

### Direct Web Launch

```bash
npm run web
```

### Direct Android Emulator / Device Launch

```bash
npm run android
```

---

## Demo Credentials (Mock Mode)

When running in Mock Mode (`EXPO_PUBLIC_IS_MOCKING=true`), use the pre-configured credentials:

| Field | Value |
|---|---|
| **Email** | `admin@freshplan.local` |
| **Password** | `admin123` |

*(In Live Mode, you can register a new account or log in with credentials registered in your Supabase Auth project).*

---

## Code Quality & Verification

Run static type checking and code formatting checks:

```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint check
npm run lint
```

---

## Building Android APK Release

To generate a standalone release APK:

1. Generate the native Android project:
   ```bash
   npx expo prebuild --platform android
   ```
2. Ensure `ANDROID_HOME` or `android/local.properties` points to your Android SDK directory.
3. Build the release APK:
   ```bash
   cd android
   ./gradlew assembleRelease --no-daemon
   ```
4. The output APK will be located at:
   `android/app/build/outputs/apk/release/app-release.apk`
