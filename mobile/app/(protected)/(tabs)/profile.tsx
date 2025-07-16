import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import userAuthStore from "../../../utils/store";

const AccountSettings = () => {
  const router = useRouter();
  const { user } = userAuthStore();
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;

  if (!parsedUser || parsedUser.role !== "admin") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-red-500 text-xl font-bold">Access Denied</Text>
        <Text className="text-gray-600 mt-2 text-center">
          You are not authorized to view this page.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F3F4F6]">
      <View className="my-4 mx-4 bg-white py-4 rounded-sm shadow-sm">
        <View className="flex-row items-center justify-between">
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          {/* Center Title */}
          <Text className="text-xl font-semibold text-center flex-1">
            Account Settings
          </Text>
          {/* Spacer to balance layout */}
          <View style={{ width: 24 }} />
          <View style={{ width: 24 }}>
            <Text> </Text>
          </View>
          {/* Same width as the icon for spacing */}
        </View>
      </View>

      <View className=" my-4 mx-4">
        <TouchableOpacity
          className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-md shadow mb-4"
          onPress={() => router.push("/dashboard")}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="stats-chart-outline" size={30} color="#2d6a4f" />
            <Text className="ml-3 text-xl font-semibold text-green-800">
              Dashboard
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-md shadow mb-4"
          onPress={() => router.push("/adminProfile")}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="person-circle-outline" size={30} color="#2d6a4f" />
            <Text className="ml-3 text-xl font-semibold text-green-800">
              Account
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-md shadow mb-4"
          onPress={() => router.push("/priceDetails")}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="pricetag-outline" size={30} color="#2d6a4f" />
            <Text className="ml-3 text-xl font-semibold text-green-800">
              Price Details
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-md shadow mb-4"
          onPress={() => router.push("/(protected)/(staff)/staffPage")}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="people-outline" size={30} color="#2d6a4f" />
            <Text className="ml-3 text-xl font-semibold text-green-800">
              Staff List
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={25} color="#2d6a4f" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountSettings;
