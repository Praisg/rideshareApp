// Load environment variables from .env file
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional - Expo will use process.env from shell
  console.warn('dotenv not available, using process.env');
}

module.exports = {
  expo: {
    name: "Ride App",
    slug: "rideapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ritik.rideapp",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY || ""
      }
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAP_API_KEY || ""
        }
      },
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.ritik.rideapp"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos for ID verification."
        }
      ],
      "expo-font",
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_MAP_API_KEY || ""
    }
  }
};

