import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, Keyboard, Modal, Animated, StyleSheet } from "react-native";
import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useUserStore } from "@/store/userStore";
import { rideStyles } from "@/styles/rideStyles";
import { StatusBar } from "expo-status-bar";
import { calculateFare, getSuggestedPriceRange } from "@/utils/mapUtils";
import RoutesMap from "@/components/customer/RoutesMap";
import CustomText from "@/components/shared/CustomText";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { commonStyles } from "@/styles/commonStyles";
import CustomButton from "@/components/shared/CustomButton";
import { createRide } from "@/service/rideService";
import { Colors } from "@/utils/Constants";

const RideBooking = () => {
  const route = useRoute() as any;
  const item = route?.params as any;
  const { location } = useUserStore() as any;
  const [selectedOption, setSelectedOption] = useState("Bike");
  const [loading, setLoading] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [showOfferSheet, setShowOfferSheet] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const farePrices = useMemo(
    () => calculateFare(parseFloat(item?.distanceInKm)),
    [item?.distanceInKm]
  );

  const vehicleTypeMapping: Record<string, string> = {
    "Bike": "bike",
    "Cab Economy": "cabEconomy",
    "Cab Premium": "cabPremium",
  };

  const priceRange = useMemo(
    () => getSuggestedPriceRange(
      parseFloat(item?.distanceInKm), 
      vehicleTypeMapping[selectedOption] || "bike"
    ),
    [item?.distanceInKm, selectedOption]
  );

  const getDropTime = (additionalMinutes: number = 0) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + (farePrices?.estimatedTime || 0) + additionalMinutes);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const rideOptions = useMemo(
    () => [
      {
        type: "Bike",
        seats: 1,
        time: `${farePrices?.estimatedTime || 1} min`,
        dropTime: getDropTime(0),
        price: farePrices?.bike,
        isFastest: true,
        icon: require("@/assets/icons/bike.png"),
      },
      {
        type: "Cab Economy",
        seats: 4,
        time: `${farePrices?.estimatedTime || 1} min`,
        dropTime: getDropTime(0),
        price: farePrices.cabEconomy,
        icon: require("@/assets/icons/cab.png"),
      },
      {
        type: "Cab Premium",
        seats: 4,
        time: `${farePrices?.estimatedTime || 1} min`,
        dropTime: getDropTime(1),
        price: farePrices.cabPremium,
        icon: require("@/assets/icons/cab_premium.png"),
      },
    ],
    [farePrices]
  );

  const handleOptionSelect = useCallback((type: string) => {
    setSelectedOption(type);
    // Auto-open offer sheet when vehicle is selected
    if (!showOfferSheet) {
      setShowOfferSheet(true);
    }
  }, [showOfferSheet]);

  useEffect(() => {
    if (showOfferSheet) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [showOfferSheet]);

  const handleRideBooking = async () => {
    const price = parseFloat(proposedPrice);
    
    if (!proposedPrice || isNaN(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price for your ride");
      return;
    }

    if (price < priceRange.min) {
      Alert.alert(
        "Price Too Low", 
        `Your proposed price ($${price.toFixed(2)}) is below the minimum suggested price ($${priceRange.min.toFixed(2)}). Drivers may not accept this offer.`,
        [
          { text: "Change Price", style: "cancel" },
          { 
            text: "Continue Anyway", 
            onPress: () => submitRide(price),
            style: "destructive" 
          }
        ]
      );
      return;
    }

    if (price > priceRange.max) {
      Alert.alert(
        "Price Too High", 
        `Your proposed price ($${price.toFixed(2)}) is above the maximum suggested price ($${priceRange.max.toFixed(2)}). You might be overpaying.`,
        [
          { text: "Change Price", style: "cancel" },
          { 
            text: "Continue Anyway", 
            onPress: () => submitRide(price) 
          }
        ]
      );
      return;
    }

    await submitRide(price);
  };

  const submitRide = async (price: number) => {
    setLoading(true);

    try {
      const vehicleType = vehicleTypeMapping[selectedOption];
      
      if (!vehicleType) {
        Alert.alert("Error", "Please select a valid vehicle type");
        setLoading(false);
        return;
      }

      await createRide({
        vehicle: vehicleType,
        drop: {
          latitude: parseFloat(item.drop_latitude),
          longitude: parseFloat(item.drop_longitude),
          address: item?.drop_address,
        },
        pickup: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          address: location.address,
        },
        pricingModel: "fixed",
        proposedPrice: price,
        suggestedPriceRange: {
          min: priceRange.min,
          max: priceRange.max,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={rideStyles.container}>
      <StatusBar style="dark" backgroundColor="white" translucent={false} />

      {item?.drop_latitude && location?.latitude && (
        <RoutesMap
          drop={{
            latitude: parseFloat(item?.drop_latitude),
            longitude: parseFloat(item?.drop_longitude),
          }}
          pickup={{
            latitude: parseFloat(location?.latitude),
            longitude: parseFloat(location?.longitude),
          }}
        />
      )}

      {/* Vehicle Selection Bottom Sheet - Always Visible */}
      <View style={styles.vehicleBottomSheet}>
        {/* Surge Warning - Only show if surge is active */}
        {farePrices?.surgeMultiplier > 1 && (
          <View style={styles.surgeWarning}>
            <Ionicons name="flash" size={16} color="#D32F2F" />
            <CustomText fontSize={11} style={{ color: '#D32F2F', marginLeft: 6 }}>
              High demand! Prices are {farePrices.surgeMultiplier}x higher
            </CustomText>
          </View>
        )}

        <CustomText fontFamily="SemiBold" fontSize={16} style={styles.sectionTitle}>
          Choose a ride
        </CustomText>

        <ScrollView
          style={styles.vehicleScrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {rideOptions?.map((ride, index) => (
            <RideOption
              key={index}
              ride={ride}
              selected={selectedOption}
              onSelect={handleOptionSelect}
            />
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={rideStyles.backButton}
        onPress={() => router.back()}
      >
        <MaterialIcons
          name="arrow-back-ios"
          size={RFValue(14)}
          style={{ left: 4 }}
          color="black"
        />
      </TouchableOpacity>

      {/* Your Offer Modal - Slides up when vehicle selected */}
      <Modal
        visible={showOfferSheet}
        transparent
        animationType="none"
        onRequestClose={() => setShowOfferSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOfferSheet(false)}
        >
          <Animated.View
            style={[
              styles.offerSheet,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            <View style={styles.offerSheetContent}>
              <View style={styles.offerHeader}>
                <CustomText fontFamily="SemiBold" fontSize={18}>
                  Make Your Offer
                </CustomText>
                <TouchableOpacity onPress={() => setShowOfferSheet(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.selectedVehicleInfo}>
                <CustomText fontSize={12} style={{ color: '#666', marginBottom: 4 }}>
                  Selected Vehicle
                </CustomText>
                <CustomText fontFamily="Medium" fontSize={14}>
                  {selectedOption} • {rideOptions.find(r => r.type === selectedOption)?.time}
                </CustomText>
              </View>

              <View style={styles.priceInputContainer}>
                <CustomText fontFamily="Medium" fontSize={14} style={{ marginBottom: 10 }}>
                  Your Offer Price
                </CustomText>

                <View style={styles.priceInputRow}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <TextInput
                      value={proposedPrice}
                      onChangeText={setProposedPrice}
                      placeholder={`$${priceRange.suggested.toFixed(2)}`}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      style={styles.priceInput}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setProposedPrice(priceRange.suggested.toString());
                      Keyboard.dismiss();
                    }}
                    style={styles.suggestedButton}
                  >
                    <CustomText fontFamily="Medium" fontSize={11} style={{ color: Colors.white }}>
                      Use Suggested
                    </CustomText>
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRangeInfo}>
                  <View style={styles.priceRangeItem}>
                    <CustomText fontSize={10} style={{ color: '#9CA3AF' }}>Min</CustomText>
                    <CustomText fontSize={11} fontFamily="Medium">${priceRange.min.toFixed(2)}</CustomText>
                  </View>
                  <View style={styles.priceRangeItem}>
                    <CustomText fontSize={10} style={{ color: '#9CA3AF' }}>Suggested</CustomText>
                    <CustomText fontSize={11} fontFamily="Medium" style={{ color: Colors.primary }}>
                      ${priceRange.suggested.toFixed(2)}
                    </CustomText>
                  </View>
                  <View style={styles.priceRangeItem}>
                    <CustomText fontSize={10} style={{ color: '#9CA3AF' }}>Max</CustomText>
                    <CustomText fontSize={11} fontFamily="Medium">${priceRange.max.toFixed(2)}</CustomText>
                  </View>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={18} color="#856404" />
                <CustomText fontSize={10} style={{ color: '#856404', marginLeft: 8, flex: 1 }}>
                  Drivers will see your offer and can accept or counter with their price
                </CustomText>
              </View>

              <CustomButton
                title="Propose Price & Find Drivers"
                disabled={loading}
                loading={loading}
                onPress={handleRideBooking}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const RideOption = memo(({ ride, selected, onSelect }: any) => (
  <TouchableOpacity
    onPress={() => onSelect(ride?.type)}
    style={[
      styles.rideOptionCard,
      selected === ride.type && styles.rideOptionSelected,
    ]}
  >
    <View style={styles.rideOptionContent}>
      <Image source={ride?.icon} style={styles.rideOptionIcon} />

      <View style={styles.rideOptionDetails}>
        <View style={styles.rideOptionHeader}>
          <CustomText fontFamily="SemiBold" fontSize={13}>
            {ride?.type}
          </CustomText>
          {ride?.isFastest && (
            <View style={styles.fastestBadge}>
              <Ionicons name="flash" size={10} color={Colors.primary} />
              <Text style={styles.fastestText}>FASTEST</Text>
            </View>
          )}
        </View>
        <CustomText fontSize={11} style={{ color: '#6B7280', marginTop: 2 }}>
          {ride?.seats} {ride?.seats === 1 ? 'seat' : 'seats'} • {ride?.time} away
        </CustomText>
        <CustomText fontSize={10} style={{ color: '#9CA3AF', marginTop: 1 }}>
          Drop-off: {ride?.dropTime}
        </CustomText>
      </View>

      <View style={styles.rideOptionPrice}>
        <CustomText fontFamily="Bold" fontSize={16}>
          ${ride?.price?.toFixed(2)}
        </CustomText>
      </View>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  vehicleBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  surgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#111',
  },
  vehicleScrollView: {
    flex: 1,
  },
  rideOptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rideOptionSelected: {
    borderColor: '#000',
    backgroundColor: '#F9FAFB',
  },
  rideOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideOptionIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  rideOptionDetails: {
    flex: 1,
  },
  rideOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  fastestText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  rideOptionPrice: {
    alignItems: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  offerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  offerSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedVehicleInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  priceInputContainer: {
    marginBottom: 16,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: RFValue(18),
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  suggestedButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  priceRangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceRangeItem: {
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default memo(RideBooking);
