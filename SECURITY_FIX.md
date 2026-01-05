# Security Fix: Removed Hardcoded Firebase API Key

## What Was Fixed

The Firebase API key `AIzaSyCEGxinASLuWazGKRywi7YADLDKDs4KCwg` was hardcoded in `client/src/config/firebase.ts` and was committed to git history.

## Actions Taken

1. ✅ **Removed hardcoded API key** from `client/src/config/firebase.ts`
2. ✅ **Updated code to use environment variables** (`EXPO_PUBLIC_FIREBASE_API_KEY`)
3. ✅ **Added `.env.example`** template for client configuration
4. ✅ **Updated `.gitignore`** to exclude `.env` files
5. ✅ **Committed and pushed** the fix

## Important: The Key is Still in Git History

⚠️ **The API key is still visible in the previous commit** (`4a68ff5`). While the current code no longer has it, anyone with access to the repository can see it in the git history.

## Next Steps (CRITICAL)

### 1. Rotate the Firebase API Key (RECOMMENDED)

Since the key was exposed, you should rotate it:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rideshare-bd747`
3. Go to **Project Settings** > **General** tab
4. Under **Your apps**, find your iOS/Android apps
5. **Regenerate** or **restrict** the API keys:
   - For iOS: Regenerate the API key in `GoogleService-Info.plist`
   - For Android: Regenerate the API key in `google-services.json`
6. Update your local `.env` file with the new key

### 2. Set Up Environment Variables

Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

Then edit `.env` and add your Firebase credentials:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_new_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rideshare-bd747.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rideshare-bd747
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rideshare-bd747.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=913523611964
EXPO_PUBLIC_FIREBASE_APP_ID=1:913523611964:ios:f91902f62a95c8026c2639
```

### 3. Restart Metro/Expo

After updating `.env`, restart your Expo development server:

```bash
cd client
npx expo start --dev-client --localhost -c
```

### 4. (Optional) Remove from Git History

If you want to completely remove the key from git history, you can use `git filter-branch` or BFG Repo-Cleaner. **Warning:** This rewrites history and requires force push.

**Option A: Using git filter-branch (destructive)**
```bash
# WARNING: This rewrites history. Only do this if you're sure!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch client/src/config/firebase.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (requires coordination with team)
git push origin --force --all
```

**Option B: Using BFG Repo-Cleaner (safer)**
```bash
# Install BFG
brew install bfg

# Remove the file from history
bfg --delete-files client/src/config/firebase.ts

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

⚠️ **Important:** Force pushing rewrites history. Coordinate with your team before doing this!

## Current Status

- ✅ Secret removed from current code
- ✅ Code uses environment variables
- ⚠️ Secret still visible in git history (commit `4a68ff5`)
- ⚠️ Key should be rotated in Firebase Console

## Prevention

To prevent this in the future:

1. ✅ Never commit `.env` files (already in `.gitignore`)
2. ✅ Always use environment variables for secrets
3. ✅ Use `.env.example` as a template
4. ✅ Review commits before pushing (`git diff` before `git commit`)
5. ✅ Consider using a pre-commit hook to scan for secrets

