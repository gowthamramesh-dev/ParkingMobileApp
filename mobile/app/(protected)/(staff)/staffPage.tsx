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

  const menuItems = [
    {
      label: "Edit/Delete Staff",
      icon: "people-outline",
      route: "/AllStaffsScreen",
    },
    {
      label: "Create New Staff",
      icon: "person-add-outline",
      route: "/create",
    },
    {
      label: "View Staff List",
      icon: "create-outline",
      route: "/allStaffs",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-4 py-6">
      <View>
        {menuItems.map(({ label, icon, route }, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(route)}
            className="flex-row items-center justify-between bg-green-50 px-5 py-4 rounded-xl shadow-sm mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons name={icon as any} size={28} color="#2d6a4f" />
              <Text className="ml-3 text-lg font-semibold text-green-800">
                {label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={22}
              color="#2d6a4f"
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default AccountSettings;
