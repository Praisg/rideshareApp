import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// @ts-ignore - getReactNativePersistence may not be in type definitions but exists at runtime
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Firebase Web API Key from Firebase Console:
// 1. Go to https://console.firebase.google.com/
// 2. Select project: rideshare-bd747
// 3. Project Settings > General > Your apps > Web app (or add one if it doesn't exist)
// 4. Copy the "apiKey" value from the config
const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "";
if (!firebaseApiKey) {
  console.warn("⚠️ EXPO_PUBLIC_FIREBASE_API_KEY is missing! Please create a .env file in the client directory with your Firebase Web API key.");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "rideshare-bd747.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "rideshare-bd747",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "rideshare-bd747.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "913523611964",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:913523611964:ios:f91902f62a95c8026c2639",
};

// Initialize Firebase app only if it doesn't already exist (prevents duplicate app error during hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth only if it doesn't already exist
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  // Auth not initialized yet, so initialize it
  // @ts-ignore - getReactNativePersistence exists at runtime
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { app, auth };

