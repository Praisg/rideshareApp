# Environment Setup Instructions

## 🔴 CRITICAL: Firebase API Key Missing

The app is currently failing because the Firebase API key is missing. Follow these steps to fix it:

## Step 1: Create Client .env File

Create a file named `.env` in the `client` directory with the following content:

```bash
cd /Users/praisegavi/rideshareApp/client
touch .env
```

Then add this content to `.env`:

```env
# Firebase Configuration
# IMPORTANT: Replace YOUR_FIREBASE_WEB_API_KEY_HERE with your actual Firebase Web API Key
# Get it from: Firebase Console > Project Settings > General > Your apps > Web app

EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rideshare-bd747.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rideshare-bd747
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rideshare-bd747.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=913523611964
EXPO_PUBLIC_FIREBASE_APP_ID=1:913523611964:ios:f91902f62a95c8026c2639

# Google Maps API Key (already configured)
EXPO_PUBLIC_MAP_API_KEY=AIzaSyCh1ybEuYu7ypDnz0JUrHHdVVDZPh8zJRs
```

## Step 2: Get Firebase Web API Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **rideshare-bd747**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. If you see a **Web app**, click on it and copy the `apiKey` value
6. If you don't see a Web app:
   - Click **Add app** → Select **Web** (</> icon)
   - Register the app (name it "RideApp Web" or similar)
   - Copy the `apiKey` from the config object shown
7. Replace `YOUR_FIREBASE_WEB_API_KEY_HERE` in your `.env` file with the actual API key

## Step 3: Restart Metro Bundler

After creating/updating the `.env` file:

```bash
cd /Users/praisegavi/rideshareApp/client
# Kill existing Metro
killall -9 node 2>/dev/null || true
# Start Metro with cache clear
npx expo start --dev-client --localhost --clear
```

## Step 4: Rebuild the App

```bash
cd /Users/praisegavi/rideshareApp/client
npx expo run:ios
```

## ✅ Configuration Verification

### Client Configuration (✅ All Correct)

- **Firebase Config**: `client/src/config/firebase.ts`
  - Project ID: `rideshare-bd747` ✅
  - Auth Domain: `rideshare-bd747.firebaseapp.com` ✅
  - Storage Bucket: `rideshare-bd747.firebasestorage.app` ✅
  - Messaging Sender ID: `913523611964` ✅
  - App ID: `1:913523611964:ios:f91902f62a95c8026c2639` ✅
  - **API Key**: Missing - needs to be set in `.env` file ❌

- **Google Maps**: `client/app.json`
  - API Key: `AIzaSyCh1ybEuYu7ypDnz0JUrHHdVVDZPh8zJRs` ✅
  - Used in: `RiderLiveTracking.tsx`, `RoutesMap.tsx`, `LiveTrackingMap.tsx` ✅

- **Server URLs**: `client/src/service/config.tsx`
  - BASE_URL (iOS Simulator): `http://localhost:3000` ✅
  - BASE_URL (Physical Device): `http://10.0.0.136:3000` ✅
  - SOCKET_URL (iOS Simulator): `ws://localhost:3000` ✅
  - SOCKET_URL (Physical Device): `ws://10.0.0.136:3000` ✅

### Server Configuration

- **Firebase Admin**: `server/config/firebase.js`
  - Project ID: `rideshare-bd747` ✅
  - Uses environment variables: `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` ✅
  - Server `.env` file exists ✅

## 📝 Notes

1. **Firebase Web API Key vs iOS/Android Keys**: 
   - The Web API key is different from the iOS/Android keys
   - You need to create a Web app in Firebase Console to get the Web API key
   - The Web API key is used by the Firebase JavaScript SDK in React Native

2. **Environment Variables**:
   - Expo requires `EXPO_PUBLIC_` prefix for environment variables
   - After updating `.env`, you must restart Metro bundler
   - The `.env` file is gitignored (not committed to git)

3. **Server Configuration**:
   - Server `.env` already exists at `server/.env`
   - Server Firebase config is optional (will work without it, but Firebase auth features will be disabled)

## 🔍 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- **Cause**: Missing or invalid `EXPO_PUBLIC_FIREBASE_API_KEY` in `.env` file
- **Fix**: 
  1. Verify `.env` file exists in `client/` directory
  2. Check that `EXPO_PUBLIC_FIREBASE_API_KEY` has a valid value (starts with `AIzaSy`)
  3. Restart Metro bundler after updating `.env`

### Error: "Failed to load app from http://..."
- **Cause**: Metro bundler not running or wrong URL
- **Fix**: 
  1. Start Metro: `npx expo start --dev-client --localhost --clear`
  2. Make sure Metro is running before launching the app

### Maps not showing
- **Cause**: Google Maps API key issue
- **Fix**: Verify `EXPO_PUBLIC_MAP_API_KEY` is set in `.env` (already configured ✅)

