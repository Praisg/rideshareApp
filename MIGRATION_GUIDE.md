# Migration Guide: Moving to Environment Variables

## ✅ What Was Done

All sensitive data has been removed from the codebase and moved to environment variables:

### Code Changes

1. **Server (`server/utils/mapUtils.js`)**
   - ❌ Removed: `const GOOGLE_MAPS_API_KEY = 'AIzaSy...'`
   - ✅ Added: `const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''`

2. **Client Configuration**
   - ✅ Created: `client/app.config.js` - Reads from `.env` file
   - ✅ Updated: `client/app.json` - Uses placeholders
   - ✅ Updated: iOS `Info.plist` and `AppDelegate.swift` - Read from config
   - ✅ Updated: Android `AndroidManifest.xml` - Uses placeholder

3. **Documentation Files**
   - ✅ Sanitized: All `.md` files - API keys replaced with placeholders
   - ✅ Sanitized: All `.sh` files - MongoDB URIs replaced with placeholders

### New Files Created

1. `client/.env.example` - Template for client environment variables
2. `server/.env.example` - Template for server environment variables  
3. `SECURITY.md` - Security best practices guide
4. `client/app.config.js` - Expo config that reads from `.env`

## 🚀 Next Steps for You

### 1. Create Your `.env` Files

**Client:**
```bash
cd client
cp .env.example .env
# Edit .env and add your actual API keys
```

**Server:**
```bash
cd server
cp .env.example .env
# Edit .env and add your actual values
```

### 2. Add Your Actual Values

**Client `.env`:**
```bash
EXPO_PUBLIC_MAP_API_KEY=your_actual_google_maps_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Server `.env`:**
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rideshare
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
ACCESS_TOKEN_SECRET=your_generated_secret_64_chars
REFRESH_TOKEN_SECRET=your_generated_secret_64_chars
# ... other variables
```

### 3. Install Dependencies (if needed)

**Client:**
```bash
cd client
npm install
# dotenv will be installed as devDependency
```

### 4. Rebuild Native Apps

After updating `.env` files, you need to rebuild native apps:

```bash
cd client
npx expo prebuild --clean
```

This will regenerate iOS and Android native files with the correct API keys from your `.env` file.

### 5. Restart Servers

**Server:**
```bash
cd server
npm start
```

The server will now read from `server/.env`.

## ⚠️ Important: Rotate Exposed Secrets

Since these secrets were previously committed to git:

1. **Rotate Google Maps API Keys:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Delete old keys and create new ones
   - Update your `.env` files

2. **Rotate Firebase API Keys:**
   - Go to https://console.firebase.google.com/
   - Project Settings → General → Your apps
   - Regenerate API keys if possible
   - Update your `.env` files

3. **Change MongoDB Atlas Password:**
   - Go to MongoDB Atlas
   - Database Access → Edit user → Change password
   - Update `MONGO_URI` in `server/.env`

4. **Generate New JWT Secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run twice to get different secrets for access and refresh tokens.

## ✅ Verification

After setup, verify everything works:

1. **Server:**
   ```bash
   cd server
   npm start
   # Should connect to MongoDB and start without errors
   ```

2. **Client:**
   ```bash
   cd client
   npx expo start
   # Maps should load correctly
   ```

## 📝 Files Changed Summary

### Code Files (6 files)
- `server/utils/mapUtils.js`
- `client/app.config.js` (new)
- `client/app.json`
- `client/ios/RideApp/AppDelegate.swift`
- `client/ios/RideApp/Info.plist`
- `client/android/app/src/main/AndroidManifest.xml`

### Documentation Files (59+ files)
- All `.md` files sanitized
- All `.sh` files sanitized
- API keys replaced with placeholders
- MongoDB URIs replaced with placeholders

### New Files (4 files)
- `client/.env.example`
- `server/.env.example`
- `SECURITY.md`
- `MIGRATION_GUIDE.md` (this file)

## 🔒 Security Checklist

- [x] All API keys removed from code
- [x] All API keys removed from documentation
- [x] MongoDB URIs sanitized in documentation
- [x] `.env` files added to `.gitignore`
- [x] `.env.example` files created as templates
- [ ] **YOU NEED TO:** Create actual `.env` files with your keys
- [ ] **YOU NEED TO:** Rotate all exposed secrets
- [ ] **YOU NEED TO:** Rebuild native apps after updating `.env`

## Need Help?

See `SECURITY.md` for detailed security best practices and troubleshooting.

