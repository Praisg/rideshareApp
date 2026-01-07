import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { StatusBar } from "expo-status-bar";
import { homeStyles } from "@/styles/homeStyles";
import { commonStyles } from "@/styles/commonStyles";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/utils/Constants";
import CustomText from "@/components/shared/CustomText";
import { uiStyles } from "@/styles/uiStyles";
import LocationInput from "@/components/customer/LocationInput";
import {
  calculateDistance,
  getLatLong,
  getPlacesSuggestions,
  reverseGeocode,
} from "@/utils/mapUtils";
import { locationStyles } from "@/styles/locationStyles";
import LocationItem from "@/components/customer/LocationItem";
import MapPickerModal from "@/components/customer/MapPickerModal";

const LocationSelection = () => {
  const { location, setLocation } = useUserStore();

  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropCoords, setDropCoords] = useState<any>(null);
  const [drop, setDrop] = useState("");
  const [locations, setLocations] = useState([]);
  const [focusedInput, setFocusedInput] = useState("drop");
  const [modalTitle, setModalTitle] = useState("drop");
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [currentLocationItem, setCurrentLocationItem] = useState<any>(null);

  const fetchLocation = async (query: string) => {
    if (query?.length > 4) {
      const data = await getPlacesSuggestions(query);
      setLocations(data);
    }
  };

  const addLocation = async (id: string, item?: any) => {
    // Handle current location selection
    if (id === 'current-location' && item?.coordinates) {
      const data = item.coordinates;
      if (focusedInput === "drop") {
        setDrop(data.address);
        setDropCoords(data);
      } else {
        setLocation(data);
        setPickupCoords(data);
        setPickup(data.address);
      }
      setLocations([]);
      return;
    }

    // Handle regular place selection
    const data = await getLatLong(id);
    if (data) {
      if (focusedInput === "drop") {
        setDrop(data?.address);
        setDropCoords(data);
      } else {
        setLocation(data);
        setPickupCoords(data);
        setPickup(data?.address);
      }
    }
  };

  const renderLocations = ({ item }: any) => {
    // Render current location with special styling
    if (item?.isCurrentLocation) {
      return (
        <TouchableOpacity
          style={[commonStyles.flexRow, locationStyles.container, styles.currentLocationContainer]}
          onPress={() => addLocation(item.place_id, item)}
        >
          <View style={styles.currentLocationIconContainer}>
            <Ionicons name="locate" size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <CustomText fontFamily="SemiBold" fontSize={14} style={styles.currentLocationMain}>
              {item.structured_formatting?.main_text}
            </CustomText>
            <CustomText fontFamily="Regular" fontSize={12} style={locationStyles.address}>
              {item.structured_formatting?.secondary_text}
            </CustomText>
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
      <LocationItem item={item} onPress={() => addLocation(item?.place_id)} />
    );
  };

  const checkDistance = async () => {
    if (!pickupCoords || !dropCoords) return;

    const { latitude: lat1, longitude: lon1 } = pickupCoords;
    const { latitude: lat2, longitude: lon2 } = dropCoords;

    if (lat1 === lat2 && lon1 === lon2) {
      alert(
        "Pickup and drop locations cannot be same. Please select different locations."
      );
      return;
    }

    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    const minDistance = 0.5; // Minimum distance in km (e.g., 500 meters)
    const maxDistance = 50; // Maximum distance in km (e.g., 50 km)

    if (distance < minDistance) {
      alert(
        "The selected locations are too close. Please choose locations that are further apart."
      );
    } else if (distance > maxDistance) {
      alert(
        "The selected locations are too far apart. Please select a closer drop location."
      );
    } else {
      setLocations([]);
      router.navigate({
        pathname: "/customer/ridebooking",
        params: {
          distanceInKm: distance.toFixed(2),
          drop_latitude: dropCoords?.latitude,
          drop_longitude: dropCoords?.longitude,
          drop_address: drop,
        },
      });

      console.log(`Distance is valid : ${distance.toFixed(2)} km`);
    }
  };

  useEffect(() => {
    if (dropCoords && pickupCoords) {
      checkDistance();
    } else {
      setLocations([]);
      setMapModalVisible(false);
    }
  }, [dropCoords, pickupCoords]);

  useEffect(() => {
    if (location) {
      setPickupCoords(location);
      setPickup(location?.address);
      
      // Create current location item for suggestions
      reverseGeocode(location.latitude, location.longitude).then((address) => {
        if (address) {
          setCurrentLocationItem({
            place_id: 'current-location',
            description: address || `${location.latitude}, ${location.longitude}`,
            structured_formatting: {
              main_text: 'Current Location',
              secondary_text: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
            },
            isCurrentLocation: true,
            coordinates: {
              latitude: location.latitude,
              longitude: location.longitude,
              address: address || `${location.latitude}, ${location.longitude}`,
            }
          });
        }
      });
    }
  }, [location]);

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
      <SafeAreaView />
      <TouchableOpacity
        style={commonStyles.flexRow}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.iosColor} />
        <CustomText fontFamily="Regular" style={{ color: Colors.iosColor }}>
          Back
        </CustomText>
      </TouchableOpacity>

      <View style={uiStyles.locationInputs}>
        <LocationInput
          placeholder="Search Pickup Location"
          type="pickup"
          value={pickup}
          onChangeText={(text) => {
            setPickup(text);
            fetchLocation(text);
          }}
          onFocus={() => setFocusedInput("pickup")}
        />

        <LocationInput
          placeholder="Search Drop Location"
          type="drop"
          value={drop}
          onChangeText={(text) => {
            setDrop(text);
            fetchLocation(text);
          }}
          onFocus={() => setFocusedInput("drop")}
        />

        <CustomText
          fontFamily="Medium"
          fontSize={10}
          style={uiStyles.suggestionText}
        >
          {focusedInput} suggestions
        </CustomText>
      </View>

      <FlatList
        data={currentLocationItem ? [currentLocationItem, ...locations] : locations}
        renderItem={renderLocations}
        keyExtractor={(item: any) => item?.place_id}
        initialNumToRender={5}
        windowSize={5}
        ListFooterComponent={
          <TouchableOpacity
            style={[commonStyles.flexRow, locationStyles.container]}
            onPress={() => {
              setModalTitle(focusedInput);
              setMapModalVisible(true);
            }}
          >
            <Image
              source={require("@/assets/icons/map_pin.png")}
              style={uiStyles.mapPinIcon}
            />
            <CustomText fontFamily="Medium" fontSize={12}>
              Select from Map
            </CustomText>
          </TouchableOpacity>
        }
      />

      {isMapModalVisible && (
        <MapPickerModal
          selectedLocation={{
            latitude:
              focusedInput === "drop"
                ? dropCoords?.latitude
                : pickupCoords?.latitude,
            longitude:
              focusedInput === "drop"
                ? dropCoords?.longitude
                : pickupCoords?.longitude,
            address: focusedInput === "drop" ? drop : pickup,
          }}
          title={modalTitle}
          visible={isMapModalVisible}
          onClose={() => setMapModalVisible(false)}
          onSelectLocation={(data) => {
            if (data) {
              if (modalTitle === "drop") {
                setDropCoords(data);
                setDrop(data?.address);
              } else {
                setLocation(data);
                setPickupCoords(data);
                setPickup(data?.address);
              }
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  currentLocationContainer: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  currentLocationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocationMain: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default LocationSelection;
