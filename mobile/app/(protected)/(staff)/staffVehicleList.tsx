


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import userAuthStore from "@/utils/store";

const VALID_IONICONS = new Set([
  "list-outline",
  "bicycle-outline",
  "car-sport-outline",
  "car-outline",
  "bus-outline",
  "alert-circle-outline",
]);

const SafeIonicon = ({ name, size = 22, color = "#000" }) => {
  const isValid = VALID_IONICONS.has(name);
  if (!isValid) {
    console.warn(`⚠️ Invalid Ionicon: ${name}`);
  }
  return (
    <Ionicons
      name={isValid ? name : "alert-circle-outline"}
      size={size}
      color={color}
    />
  );
};

const Vehicles = [
  { name: "All", value: "all", icon: "list-outline" },
  { name: "Cycle", value: "cycle", icon: "bicycle-outline" },
  { name: "Bike", value: "bike", icon: "car-sport-outline" },
  { name: "Car", value: "car", icon: "car-outline" },
  { name: "Van", value: "van", icon: "bus-outline" },
  { name: "Bus", value: "bus", icon: "bus-outline" },
];

const CheckinCard = ({ item }: any) => {
  const formattedDate = format(
    new Date(item.entryDateTime),
    "MMM d, yyyy - h:mm a"
  );

  return (
    <View className="bg-white shadow-lg rounded-md p-3 mx-4 mb-4 space-y-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 justify-center items-center">
          <Text className="text-lg font-semibold text-gray-900">
            {item.name}
          </Text>
          <Text
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.isCheckedOut
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {item.isCheckedOut ? "Checked Out" : "Active"}
          </Text>
        </View>
        <View className="flex-row justify-center items-center gap-1">
          <Text className="text-xs text-gray-500">{item.vehicleNo}</Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(item.tokenId);
              Alert.alert("Copied!", `${item.tokenId} copied to clipboard`);
            }}
          >
            <Text className="text-xs text-green-500">
              <Ionicons name="copy-outline" size={12} /> Token
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="bg-gray-100 p-1 rounded-sm">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-700 capitalize">
            {item.vehicleType}
          </Text>
          <Text className="text-sm text-gray-500">{formattedDate}</Text>
        </View>
        <View className="mt-1 space-y-1">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-700">Paid Days</Text>
            <Text className="text-sm font-medium text-gray-800">
              {item.paidDays}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-700">Rate</Text>
            <Text className="text-sm font-medium text-gray-800">
              ₹
              {isNaN(Number(item.perDayRate)) ||
              isNaN(Number(item.paidDays)) ||
              Number(item.paidDays) === 0
                ? "0.00"
                : (Number(item.perDayRate) / Number(item.paidDays)).toFixed(2)}
              /day
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-700">Total Paid</Text>
            <Text className="text-sm font-semibold text-gray-600">
              ₹{item.amount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const VehicleScreen = () => {
  const { staffId } = useLocalSearchParams();
  const isFocused = useIsFocused();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("all");
  const [checkType, setCheckType] = useState("checkins");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    isLoading,
    VehicleListData,
    checkins,
    checkouts,
    fetchCheckins,
    fetchCheckouts,
    vehicleList,
  } = userAuthStore((state) => state);

  const handleList = async (type: string) => {
    if (checkType === "checkins") {
      await fetchCheckins(type, staffId as string);
    } else if (checkType === "checkouts") {
      await fetchCheckouts(type, staffId as string);
    } else {
      await vehicleList(type, "vehicleList", staffId as string);
    }
  };

  useEffect(() => {
    if (isFocused) {
      handleList(selected);
    }
  }, [isFocused, checkType, selected]);

  const getDataToShow = () => {
    if (checkType === "checkins") return Array.isArray(checkins) ? checkins : [];
    if (checkType === "checkouts") return Array.isArray(checkouts) ? checkouts : [];
    return Array.isArray(VehicleListData) ? VehicleListData : [];
  };

  const dataToDisplay = getDataToShow();

  const filteredData = dataToDisplay?.filter((item: any) => {
    const matchesSearch =
      item.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDate = filterDate
      ? format(new Date(item.entryDateTime), "yyyy-MM-dd") ===
        format(filterDate, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-2 text-gray-500">Loading Vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CheckinCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <View className="px-4 py-4 gap-3">
              {/* 🔍 Search */}
              <View className="bg-white flex-row px-2 items-center rounded-sm">
                <Ionicons name="search-outline" size={24} />
                <TextInput
                  placeholder="Search vehicle"
                  value={search}
                  onChangeText={setSearch}
                  className="rounded text-base flex-1 px-3 h-12 bg-white"
                />
              </View>

              {/* 🚗 Vehicle Filter */}
              <View className="bg-white justify-center items-center w-full shadow-sm rounded-sm p-2">
                <View className="justify-center items-center mb-2">
                  <Text className="text-2xl font-semibold">Vehicles</Text>
                </View>
                <FlatList
                  data={Vehicles}
                  horizontal
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => {
                    const isSelected = selected === item.value;
                    return (
                      <TouchableOpacity
                        className={`mx-2 items-center justify-center px-3 py-1 rounded-lg ${
                          isSelected ? "bg-green-600" : "bg-green-400"
                        }`}
                        onPress={() => {
                          setSelected(item.value);
                          handleList(item.value);
                        }}
                      >
                        <SafeIonicon
                          name={item.icon}
                          size={22}
                          color={isSelected ? "#fff" : "#000"}
                        />
                        <Text
                          className={`text-base ${
                            isSelected ? "text-white" : "text-black"
                          }`}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              {/* 🧾 Filter Row */}
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Picker
                    selectedValue={checkType}
                    onValueChange={(val) => setCheckType(val)}
                  >
                    <Picker.Item label="Check In" value="checkins" />
                    <Picker.Item label="Check Out" value="checkouts" />
                    <Picker.Item label="Vehicle List" value="list" />
                  </Picker>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-blue-100 px-3 py-2 rounded shadow-sm"
                >
                  <Text className="text-sm text-blue-800">
                    {filterDate
                      ? format(filterDate, "MMM dd, yyyy")
                      : "Pick Date"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 📅 Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={filterDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setFilterDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-500 text-base">
                No vehicle data found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VehicleScreen;

