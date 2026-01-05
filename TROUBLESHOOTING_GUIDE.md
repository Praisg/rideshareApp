# Troubleshooting Guide - Missing Icons & Network Errors

## Issues Identified

### 1. ❌ "Failed to fetch cuisines: AxiosError: Network Error"
**Problem**: The app cannot fetch cuisine data from the backend server.

**Root Cause**: 
- Backend server may not be running
- Network connectivity issue between app and server
- Server endpoint might be failing

**Solution**:
1. **Ensure server is running**:
   ```bash
   cd /Users/praisegavi/rideshareApp
   bash START_SERVER.sh
   ```
   Or manually:
   ```bash
   cd server
   npm start
   ```

2. **Verify server is accessible**:
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","message":"Server is running!"}`

3. **Test the cuisines endpoint**:
   ```bash
   curl http://localhost:3000/restaurants/cuisines
   ```
   Should return cuisine data.

4. **Check server logs** for any errors when the endpoint is called.

### 2. ❌ Missing Icons
**Problem**: Icons are not displaying in the app.

**Possible Causes**:
1. **Fonts not loaded**: Custom fonts (NotoSans) may not have finished loading
2. **Icon assets not bundled**: Image assets might not be included in the build
3. **@expo/vector-icons not working**: Vector icons library might have issues

**Solutions**:

#### A. Check Font Loading
The app uses custom fonts that must load before rendering. Check `client/src/app/index.tsx`:
- Fonts are loaded using `useFonts()` hook
- App waits for `loaded` to be `true` before navigating
- If fonts fail to load, icons using custom fonts won't display

**Fix**: Ensure all font files exist:
```bash
cd client/src/assets/fonts
ls -la
# Should show:
# - NotoSans-Bold.ttf
# - NotoSans-Regular.ttf
# - NotoSans-Medium.ttf
# - NotoSans-Light.ttf
# - NotoSans-SemiBold.ttf
```

#### B. Check Icon Assets
Image icons are stored in `client/src/assets/icons/`. Verify they exist:
```bash
cd client/src/assets/icons
ls -la
# Should show all icon PNG files
```

#### C. Rebuild App with Assets
If icons are missing, rebuild the app to ensure assets are bundled:
```bash
cd client
# Clear cache and rebuild
rm -rf .expo node_modules/.cache
npx expo start --dev-client --localhost --clear
# Then rebuild iOS app
npx expo run:ios
```

#### D. Check @expo/vector-icons
The app uses `@expo/vector-icons` (Ionicons, FontAwesome6, MaterialCommunityIcons).

**Verify installation**:
```bash
cd client
npm list @expo/vector-icons
# Should show version ^15.0.3
```

**If icons still don't show**:
1. Restart Metro bundler
2. Clear app cache in simulator: Settings → General → iPhone Storage → RideApp → Offload App
3. Rebuild the app

### 3. ⚠️ Server Connection Issues

**Symptoms**:
- Network errors in console
- "Failed to fetch" errors
- API calls timing out

**Checklist**:
1. ✅ Server is running on port 3000
2. ✅ Server health endpoint responds: `http://localhost:3000/health`
3. ✅ BASE_URL in `client/src/service/config.tsx` is correct:
   - iOS Simulator: `http://localhost:3000` ✅
   - Physical Device: `http://10.0.0.136:3000` (update IP if needed)
4. ✅ CORS is enabled on server (already configured ✅)
5. ✅ MongoDB is running and connected (check server logs)

## Quick Fixes

### Restart Everything
```bash
# 1. Kill all processes
killall -9 node 2>/dev/null || true

# 2. Start server
cd /Users/praisegavi/rideshareApp/server
npm start

# 3. In another terminal, start Metro
cd /Users/praisegavi/rideshareApp/client
npx expo start --dev-client --localhost --clear

# 4. Rebuild iOS app (if needed)
npx expo run:ios
```

### Clear All Caches
```bash
cd client
# Clear Expo cache
rm -rf .expo node_modules/.cache

# Clear iOS build
cd ios
rm -rf build Pods/build
cd ..

# Reinstall dependencies (if needed)
npm install

# Rebuild
npx expo run:ios
```

## Verification Steps

1. **Server Status**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Cuisines Endpoint**:
   ```bash
   curl http://localhost:3000/restaurants/cuisines
   ```

3. **Check App Console**:
   - Open React Native Debugger or check Metro bundler logs
   - Look for network errors or font loading errors

4. **Check Server Logs**:
   - Look for MongoDB connection errors
   - Check for any route errors

## Common Issues & Solutions

### Issue: Icons show as squares or blank
**Solution**: Fonts not loaded. Wait for splash screen to finish, or check font files exist.

### Issue: Network errors persist
**Solution**: 
- Verify server is running
- Check BASE_URL matches your setup (localhost for simulator)
- Restart both server and Metro bundler

### Issue: Some icons work, others don't
**Solution**: 
- Image icons (PNG) might be missing from assets
- Vector icons might be using wrong icon names
- Check icon imports in components

## Files to Check

1. **Server Routes**: `server/routes/restaurant.js` - cuisines endpoint
2. **API Service**: `client/src/service/eatsService.tsx` - getCuisines function
3. **Config**: `client/src/service/config.tsx` - BASE_URL
4. **Fonts**: `client/src/app/index.tsx` - font loading
5. **Icons**: `client/src/assets/icons/` - icon assets

## Next Steps

1. ✅ Ensure server is running
2. ✅ Verify fonts are loading (check splash screen timing)
3. ✅ Rebuild app if icons still missing
4. ✅ Check server logs for cuisines endpoint errors
5. ✅ Test API endpoints manually with curl

