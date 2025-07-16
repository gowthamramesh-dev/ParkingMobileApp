import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import userAuthStore from "@/utils/store";
import { SafeAreaView } from "react-native-safe-area-context";

const AccountSettings = () => {
  const router = useRouter();
  const { user } = userAuthStore();
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;

  return (
    <View className="bg-[#F3F4F6] py-4 flex-1 px-4">
      {/* ✅ Staff List Button */}
      <TouchableOpacity
        className="flex-row items-center  justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/AllStaffsScreen")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="people-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            AllStaffsScreen
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>

      {/* ✅ Create Staff Button */}
      <TouchableOpacity
        className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/create")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="person-add-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            create
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>

      {/* ✅ Today Vehicle Button */}
      <TouchableOpacity
        className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/todayVehicle")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="car-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            TodayVehicle
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>

      {/* ✅ Today Revenue Button */}
      <TouchableOpacity
        className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/todayRevenue")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="cash-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            TodayRevenue
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>

      {/* ✅ Update Staff Button */}
      <TouchableOpacity
        className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/allStaffs")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="create-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            AllStaffs
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>

      {/* ✅ Delete Staff Button */}
      <TouchableOpacity
        className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
        onPress={() => router.push("/vehicleList")}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="trash-outline" size={30} color="#2d6a4f" />
          <Text className="ml-3 text-xl font-semibold text-green-800">
            vehicleList
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
      </TouchableOpacity>
    </View>
  );
};

export default AccountSettings;
