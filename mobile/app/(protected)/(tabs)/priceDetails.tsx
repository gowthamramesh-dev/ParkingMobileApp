import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import userAuthStore from "@/utils/store"; // adjust path to your store
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type VehicleType = "cycle" | "bike" | "car" | "van" | "lorry" | "bus";

type PriceForm = {
  [key in VehicleType]: string;
};

const vehicleTypes: VehicleType[] = [
  "cycle",
  "bike",
  "car",
  "van",
  "lorry",
  "bus",
];

const PriceDetails = () => {
  const navigation = useNavigation();
  const {
    fetchPrices,
    addDailyPrices,
    addMonthlyPrices,
    updateDailyPrices,
    updateMonthlyPrices,
    priceData,
  } = userAuthStore();

  const [dailyForm, setDailyForm] = useState<PriceForm>({
    cycle: "",
    bike: "",
    car: "",
    van: "",
    lorry: "",
    bus: "",
  });

  const [monthlyForm, setMonthlyForm] = useState<PriceForm>({
    cycle: "",
    bike: "",
    car: "",
    van: "",
    lorry: "",
    bus: "",
  });

  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");

  useEffect(() => {
    const loadPrices = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!token || !user) return;

      await fetchPrices(user._id, token);
    };

    loadPrices();
  }, []);

  useEffect(() => {
    if (priceData?.dailyPrices) {
      setDailyForm({ ...dailyForm, ...priceData.dailyPrices });
    }
    if (priceData?.monthlyPrices) {
      setMonthlyForm({ ...monthlyForm, ...priceData.monthlyPrices });
    }
  }, [priceData]);

  const handleChange = (
    type: VehicleType,
    value: string,
    mode: "daily" | "monthly"
  ) => {
    if (mode === "daily") {
      setDailyForm((prev) => ({ ...prev, [type]: value }));
    } else {
      setMonthlyForm((prev) => ({ ...prev, [type]: value }));
    }
  };

  const isFormValid = (mode: "daily" | "monthly") => {
    const form = mode === "daily" ? dailyForm : monthlyForm;
    return vehicleTypes.every((type) => form[type].trim() !== "");
  };

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));

    if (!token || !user) return;

    try {
      if (activeTab === "daily") {
        await addDailyPrices(user._id, dailyForm, token);
      } else {
        await addMonthlyPrices(user._id, monthlyForm, token);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${activeTab} prices added successfully ✅`,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: String(err),
      });
    }
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));

    if (!token || !user) return;

    try {
      if (activeTab === "daily") {
        await updateDailyPrices(user._id, dailyForm, token);
      } else {
        await updateMonthlyPrices(user._id, monthlyForm, token);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${activeTab} prices updated successfully ✅`,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: String(err),
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="bg-[#F3F4F6] py-4 flex-1 px-4"
    >
      <View className="gap-5">
        <View className="bg-white py-4 px-4 rounded-sm shadow-sm">
          <View className="flex-row items-center justify-between">
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            {/* Title Centered */}
            <Text className="text-xl font-semibold text-center flex-1">
              Manage Price List
            </Text>

            <Ionicons name="arrow-back" size={24} color="transparent" />
          </View>
        </View>

        <ScrollView className="">
          <View className="flex-row shadow-md justify-around mb-6">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-l-md ${
                activeTab === "daily" ? "bg-green-600" : "bg-white"
              }`}
              onPress={() => setActiveTab("daily")}
            >
              <Text
                className={`text-center text-lg font-bold ${
                  activeTab === "daily" ? "text-white" : "text-green-800"
                }`}
              >
                Daily Prices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-r-md ${
                activeTab === "monthly" ? "bg-green-600" : "bg-white"
              }`}
              onPress={() => setActiveTab("monthly")}
            >
              <Text
                className={`text-center text-lg font-bold ${
                  activeTab === "monthly" ? "text-white" : "text-green-800"
                }`}
              >
                Monthly Prices
              </Text>
            </TouchableOpacity>
          </View>
          {/* Input Section */}
          <View className="bg-white shadow rounded-lg px-4 py-4 mb-6">
            {vehicleTypes.map((type) => (
              <View key={type} className="mb-4">
                <Text className="text-base font-semibold text-gray-800 capitalize mb-1">
                  {type}
                </Text>
                <TextInput
                  value={
                    activeTab === "daily" ? dailyForm[type] : monthlyForm[type]
                  }
                  onChangeText={(val) => handleChange(type, val, activeTab)}
                  placeholder={`Enter ${type} ${activeTab} price`}
                  keyboardType="numeric"
                  className="border border-gray-300 rounded px-4 py-2 bg-blue-100"
                />
              </View>
            ))}
          </View>
          {/* Buttons */}
          <View className="flex-row justify-between gap-4 mb-4">
            <TouchableOpacity
              className={`flex-1 bg-green-600 py-4 rounded-sm ${
                !isFormValid(activeTab) ? "opacity-50" : ""
              }`}
              onPress={handleAdd}
              disabled={!isFormValid(activeTab)}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Add Price
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 bg-green-500 py-4 rounded-sm ${
                !isFormValid(activeTab) ? "opacity-50" : ""
              }`}
              onPress={handleUpdate}
              disabled={!isFormValid(activeTab)}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Update Price
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default PriceDetails;
