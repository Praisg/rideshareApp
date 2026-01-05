# Security Guide - Environment Variables

## ⚠️ Important Security Notice

This repository has been updated to use environment variables for all sensitive data. **Never commit actual API keys, passwords, or secrets to version control.**

## What Was Changed

All sensitive information has been removed from the codebase and moved to environment variable files:

1. **Google Maps API Keys** - Now use `EXPO_PUBLIC_MAP_API_KEY` (client) and `GOOGLE_MAPS_API_KEY` (server)
2. **Firebase API Keys** - Now use `EXPO_PUBLIC_FIREBASE_API_KEY` and related variables
3. **MongoDB Connection Strings** - Now use `MONGO_URI` with credentials in `.env` file
4. **JWT Secrets** - Now use `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`

## Setup Instructions

### Client Setup

1. **Copy the example file:**
   ```bash
   cd client
   cp .env.example .env
   ```

2. **Fill in your values in `client/.env`:**
   ```bash
   EXPO_PUBLIC_MAP_API_KEY=your_actual_google_maps_api_key
   EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
   # ... other Firebase variables
   ```

3. **Rebuild the app** (native files need to be regenerated):
   ```bash
   npx expo prebuild --clean
   ```

### Server Setup

1. **Copy the example file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Fill in your values in `server/.env`:**
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rideshare
   GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
   ACCESS_TOKEN_SECRET=your_generated_secret
   # ... other variables
   ```

## Files Updated

### Code Files
- `server/utils/mapUtils.js` - Now uses `process.env.GOOGLE_MAPS_API_KEY`
- `client/app.config.js` - New file that reads from `.env` for Expo config
- `client/ios/RideApp/AppDelegate.swift` - Reads from Info.plist (set by app.config.js)
- `client/ios/RideApp/Info.plist` - Uses placeholder (set by app.config.js)
- `client/android/app/src/main/AndroidManifest.xml` - Uses placeholder (set by app.config.js)

### Documentation Files
All documentation files have been sanitized:
- Removed actual API keys
- Replaced MongoDB URIs with placeholders
- Updated examples to use environment variables

## Git Configuration

The following files are **ignored** by git (in `.gitignore`):
- `client/.env`
- `server/.env`
- `*.env.local`

The following files are **committed** (safe templates):
- `client/.env.example`
- `server/.env.example`

## Rotating Exposed Secrets

If secrets were previously committed to git history:

1. **Rotate all exposed API keys:**
   - Google Maps: https://console.cloud.google.com/apis/credentials
   - Firebase: https://console.firebase.google.com/
   - MongoDB Atlas: Change database password

2. **Generate new JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update your `.env` files** with new values

4. **Consider using git-secrets or BFG Repo-Cleaner** to remove secrets from git history

## Best Practices

1. ✅ Always use `.env.example` as a template
2. ✅ Never commit `.env` files
3. ✅ Use different secrets for development and production
4. ✅ Rotate secrets regularly
5. ✅ Use environment-specific `.env` files (`.env.development`, `.env.production`)
6. ✅ Review git history before pushing sensitive data

## Need Help?

If you encounter issues:
1. Check that `.env` files exist in both `client/` and `server/` directories
2. Verify all required variables are set
3. For client: Run `npx expo prebuild --clean` after updating `.env`
4. For server: Restart the server after updating `.env`

