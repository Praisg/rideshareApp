import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "./storage";

type CustomLocation = {
  latitude: number;
  longitude: number;
  address: string;
} | null;

interface SavedPlace {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface RecentLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    promo: boolean;
  };
  accessibility: {
    largerText: boolean;
    highContrast: boolean;
  };
}

interface UserStoreProps {
  user: any;
  location: CustomLocation;
  outOfRange: boolean;
  savedPlaces: SavedPlace[];
  recentLocations: RecentLocation[];
  preferences: UserPreferences;
  setUser: (data: any) => void;
  setOutOfRange: (data: boolean) => void;
  setLocation: (data: CustomLocation) => void;
  setSavedPlaces: (places: SavedPlace[]) => void;
  addSavedPlace: (place: SavedPlace) => void;
  removeSavedPlace: (id: string) => void;
  addRecentLocation: (address: string, latitude: number, longitude: number) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  clearData: () => void;
}

const defaultPreferences: UserPreferences = {
  notifications: {
    push: true,
    email: true,
    sms: true,
    promo: false,
  },
  accessibility: {
    largerText: false,
    highContrast: false,
  },
};

export const useUserStore = create<UserStoreProps>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      outOfRange: false,
      savedPlaces: [],
      recentLocations: [],
      preferences: defaultPreferences,
      setUser: (data) => set({ user: data }),
      setLocation: (data) => set({ location: data }),
      setOutOfRange: (data) => set({ outOfRange: data }),
      setSavedPlaces: (places) => set({ savedPlaces: places }),
      addSavedPlace: (place) =>
        set((state) => ({
          savedPlaces: [
            ...state.savedPlaces.filter((p) => p.id !== place.id),
            place,
          ],
        })),
      removeSavedPlace: (id) =>
        set((state) => ({
          savedPlaces: state.savedPlaces.filter((p) => p.id !== id),
        })),
      addRecentLocation: (address, latitude, longitude) =>
        set((state) => {
          // Parse address to extract main location and city
          const parts = address.split(',').map(s => s.trim());
          const name = parts[0] || address;
          const city = parts.length > 1 ? parts.slice(-2).join(', ') : 'Unknown';
          
          const newLocation: RecentLocation = {
            id: `${latitude}-${longitude}`,
            name,
            city,
            address,
            latitude,
            longitude,
            timestamp: Date.now(),
          };
          
          // Filter out duplicate locations (within 100m radius)
          const filteredLocations = state.recentLocations.filter((loc) => {
            const distance = Math.sqrt(
              Math.pow(loc.latitude - latitude, 2) + 
              Math.pow(loc.longitude - longitude, 2)
            );
            return distance > 0.001; // ~100m threshold
          });
          
          // Keep only last 5 locations, newest first
          const updatedLocations = [newLocation, ...filteredLocations].slice(0, 5);
          
          return { recentLocations: updatedLocations };
        }),
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      clearData: () =>
        set({
          user: null,
          location: null,
          outOfRange: false,
          savedPlaces: [],
          recentLocations: [],
          preferences: defaultPreferences,
        }),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        savedPlaces: state.savedPlaces,
        recentLocations: state.recentLocations,
        preferences: state.preferences,
      }),
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
