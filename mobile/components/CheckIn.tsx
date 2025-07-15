import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";

const vehicleTypes = ["cycle", "bike", "car", "van", "lorry", "bus"];

const CheckIn = () => {
  const [name, setName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("cycle");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState("1");
  const [amount, setAmount] = useState(0);

  const { checkIn, fetchPrices, priceData } = useAuthStore();

  useEffect(() => {
    const loadPrices = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (token && user?._id) {
        await fetchPrices(user._id, token);
      }
    };
    loadPrices();
  }, [fetchPrices]);

  useEffect(() => {
    const rate = Number(priceData?.dailyPrices?.[vehicleType] || 0);
    setAmount(rate * Number(days));
  }, [vehicleType, days, priceData]);

  const clearForm = () => {
    setName("");
    setVehicleNo("");
    setVehicleType("cycle");
    setMobile("");
    setPaymentMethod("cash");
    setDays("1");
    setAmount(0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!vehicleNo || !mobile) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Vehicle number and mobile are required",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    if (!amount) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not determine amount. Please check prices.",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    const result = await checkIn(
      name,
      vehicleNo,
      vehicleType,
      mobile,
      paymentMethod,
      Number(days),
      amount
    );

    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Check In Failed",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Check In Success",
      text2: "Vehicle Checked In",
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
    });

    clearForm();
  };

  return (
    <View className="gap-5 p-4">
      <Text className="text-2xl font-bold">Check In</Text>
      <View className="bg-white rounded-lg shadow-md p-4 gap-3 space-y-4">
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          className="h-12 w-full px-3 rounded-sm border border-gray-200 bg-blue-100 text-base"
        />
        <TextInput
          placeholder="Vehicle Number"
          value={vehicleNo}
          onChangeText={(text) => setVehicleNo(text.toUpperCase())}
          className="h-12 w-full px-3 rounded-sm border border-gray-200 bg-blue-100 text-base"
        />
        <View className="h-12 w-full rounded-sm border border-gray-200 bg-blue-100">
          <Picker
            selectedValue={vehicleType}
            onValueChange={setVehicleType}
            style={{ height: 48, backgroundColor: "transparent" }}
          >
            <Picker.Item label="Select Vehicle Type" value="" />
            {vehicleTypes.map((type) => (
              <Picker.Item
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                value={type}
              />
            ))}
          </Picker>
        </View>
        <TextInput
          placeholder="Mobile Number"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="number-pad"
          className="h-12 w-full px-3 rounded-sm border border-gray-200 bg-blue-100 text-base"
        />
        <View className="h-12 w-full rounded-sm border border-gray-200 bg-blue-100">
          <Picker
            selectedValue={days}
            onValueChange={(val) => setDays(val)}
            style={{ height: 48, backgroundColor: "transparent" }}
          >
            <Picker.Item label="Select Days" value="" />
            {[...Array(7)].map((_, i) => (
              <Picker.Item
                key={i + 1}
                label={`${i + 1} Day${i > 0 ? "s" : ""}`}
                value={`${i + 1}`}
              />
            ))}
          </Picker>
        </View>
        <View className="h-12 w-full rounded-sm border border-gray-200 bg-blue-100">
          <Picker
            selectedValue={paymentMethod}
            onValueChange={setPaymentMethod}
            style={{ height: 48, backgroundColor: "transparent" }}
          >
            <Picker.Item label="Select Payment Method" value="" />
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="GPay" value="gpay" />
            <Picker.Item label="PhonePe" value="phonepe" />
            <Picker.Item label="Paytm" value="paytm" />
          </Picker>
        </View>
        <View className="items-center">
          <Text className="text-xl font-semibold">Amount: ₹{amount}</Text>
        </View>
        <TouchableOpacity
          className="bg-green-600 p-3 rounded-lg items-center"
          onPress={handleSubmit}
        >
          {isLoading ? (
            <View className="bg-white p-2 rounded-full">
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : (
            <Text className="text-center text-xl text-white font-semibold">
              Enter
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ToastManager showCloseIcon={false} />
    </View>
  );
};

export default CheckIn;
