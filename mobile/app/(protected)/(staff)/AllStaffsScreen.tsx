import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Platform,
  ToastAndroid,
  Clipboard,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { BlurView } from "expo-blur";
import userAuthStore from "@/utils/store";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const AllStaffs = () => {
  const { getAllStaffs, staffs, isLoading, deleteStaff, updateStaff } =
    userAuthStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [buildingLocation, setBuildingLocation] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const res = await getAllStaffs();
    if (!res.success) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch staff list",
        text2: res.error || "",
      });
    }
  };

  const handleDelete = (staffId) => {
    Alert.alert("Delete Staff", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const result = await deleteStaff(staffId);
          if (!result.success) {
            Toast.show({
              type: "error",
              text1: "Delete Failed",
              text2: result.error || "Failed to delete staff",
            });
          } else {
            Toast.show({
              type: "success",
              text1: "Deleted Successfully",
              visibilityTime: 2000,
            });
            await fetchStaffs();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditPress = (staff) => {
    setEditStaffId(staff._id);
    setEditUsername(staff.username);
    setEditPassword("");
    setPasswordVisible(false);
    setBuildingName(staff?.building?.name || "");
    setBuildingLocation(staff?.building?.location || "");
    setModalVisible(true);
  };

  const handleSaveUpdate = async () => {
    if (!editStaffId || !editUsername) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username is required.",
      });
      return;
    }

    const updates = {
      username: editUsername,
      building: {
        name: buildingName,
        location: buildingLocation,
      },
    };

    if (editPassword) updates.password = editPassword;

    const result = await updateStaff(editStaffId, updates);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: result.error || "Failed to update staff",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Staff Updated ✅",
        text2: "Changes saved successfully.",
      });
      setModalVisible(false);
      fetchStaffs();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={() => setSelectedStaff(item)}>
            <Ionicons name="eye-outline" size={22} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPress(item)}>
            <Ionicons name="create-outline" size={22} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }}>
      <View
        style={{
          marginBottom: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          height: 48,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", left: 0 }}
        >
          <Ionicons name="arrow-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1F2937" }}>
          Staff Details
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : staffs.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#6B7280" }}>
          No staff found
        </Text>
      ) : (
        <FlatList
          data={staffs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionIcons: {
    flexDirection: "row",
    gap: 16,
  },
});

export default AllStaffs;
