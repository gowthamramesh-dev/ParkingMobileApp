import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "@react-native-community/datetimepicker";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";

interface FormData {
  name: string;
  vehicleNo: string;
  mobile: string;
  vehicleType: string;
  duration: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  amount?: number;
}

type VehicleType = "cycle" | "bike" | "car" | "van" | "lorry" | "bus";

interface MonthlyPassModalProps {
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onPassCreated: (pass: any) => void; // Adjusted to `any` to accommodate potential pass structure
}

const MonthlyPassModal: React.FC<MonthlyPassModalProps> = ({
  isModalVisible,
  setModalVisible,
  onPassCreated,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    vehicleNo: "",
    mobile: "",
    vehicleType: "",
    duration: "",
    paymentMethod: "cash",
    startDate: "",
    endDate: "",
  });

  const { createMonthlyPass, priceData } = useAuthStore();

  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate);
      const months = parseInt(formData.duration, 10);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + months);
      setFormData({
        ...formData,
        endDate: endDate.toISOString().split("T")[0],
      });
    }
  }, [formData.startDate, formData.duration]);

  const calculateAmount = () => {
    const duration = parseInt(formData.duration || "0");
    const vehicleType = formData.vehicleType as VehicleType;

    if (!priceData?.monthlyPrices || !vehicleType || !duration) return 0;

    const monthlyRate = Number(priceData.monthlyPrices[vehicleType]);
    if (isNaN(monthlyRate)) return 0;

    return monthlyRate * duration;
  };

  const handleCreatePass = async () => {
    setIsLoading(true);
    if (
      !formData.name ||
      !formData.vehicleNo ||
      !formData.mobile ||
      !formData.vehicleType ||
      !formData.duration ||
      !formData.paymentMethod ||
      !formData.startDate
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    const amount = calculateAmount();
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

    const result = await createMonthlyPass({ ...formData, amount });
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Error in API",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Pass Created Successfully",
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
    });

    setFormData({
      name: "",
      vehicleNo: "",
      mobile: "",
      vehicleType: "",
      duration: "",
      paymentMethod: "cash",
      startDate: "",
      endDate: "",
    });

    setTimeout(() => {
      setModalVisible(false);
      onPassCreated(result.pass); // Pass the created pass to the callback
    }, 2000);
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-5 gap-3 rounded-sm w-4/5">
          <Text className="text-lg font-semibold mb-4 text-center">
            Create New Pass
          </Text>
          <TextInput
            className="border border-gray-200 bg-blue-100 rounded-sm p-3 text-base"
            placeholder="Customer Name"
            value={formData.name}
            onChangeText={(text: string) =>
              setFormData({ ...formData, name: text })
            }
          />
          <TextInput
            className="border border-gray-200 bg-blue-100 rounded-sm p-3 text-base"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChangeText={(text: string) =>
              setFormData({ ...formData, mobile: text })
            }
            keyboardType="phone-pad"
          />
          <TextInput
            className="border border-gray-200 bg-blue-100 rounded-sm p-3 text-base"
            placeholder="Vehicle Number"
            value={formData.vehicleNo}
            onChangeText={(text: string) =>
              setFormData({ ...formData, vehicleNo: text })
            }
          />
          <View>
            <Picker
              selectedValue={formData.vehicleType}
              onValueChange={(text) =>
                setFormData({ ...formData, vehicleType: text })
              }
              style={{ height: 52, backgroundColor: "#DBEAFE" }}
            >
              <Picker.Item label="Select Vehicle Type" value="" />
              <Picker.Item label="Cycle" value="cycle" />
              <Picker.Item label="Bike" value="bike" />
              <Picker.Item label="Car" value="car" />
              <Picker.Item label="Van" value="van" />
              <Picker.Item label="Lorry" value="lorry" />
              <Picker.Item label="Bus" value="bus" />
            </Picker>
          </View>
          <View>
            <Picker
              selectedValue={formData.duration}
              onValueChange={(text) =>
                setFormData({ ...formData, duration: text })
              }
              style={{ height: 52, backgroundColor: "#DBEAFE" }}
            >
              <Picker.Item label="Select Duration" value="" />
              {[3, 6, 9, 12].map((m) => (
                <Picker.Item key={m} label={`${m} months`} value={`${m}`} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            className="border border-gray-200 bg-blue-100 rounded-sm p-3 text-base"
            onPress={() => setDatePickerVisible(true)}
          >
            <Text className="text-base">
              {formData.startDate ? formData.startDate : "Select Start Date"}
            </Text>
          </TouchableOpacity>
          {isDatePickerVisible && (
            <DatePicker
              value={
                formData.startDate ? new Date(formData.startDate) : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, date) => {
                setDatePickerVisible(false);
                if (date) {
                  setFormData({
                    ...formData,
                    startDate: date.toISOString().split("T")[0],
                  });
                }
              }}
            />
          )}
          <View>
            <Picker
              selectedValue={formData.paymentMethod}
              onValueChange={(text) =>
                setFormData({ ...formData, paymentMethod: text })
              }
              style={{ height: 52, backgroundColor: "#DBEAFE" }}
            >
              <Picker.Item label="Select Payment Method" value="" />
              <Picker.Item label="Cash" value="cash" />
              <Picker.Item label="GPay" value="gpay" />
              <Picker.Item label="PhonePe" value="phonepe" />
              <Picker.Item label="Paytm" value="paytm" />
            </Picker>
          </View>
          <TextInput
            className="border border-gray-200 bg-blue-100 rounded-sm p-3 text-base"
            placeholder="End Date (YYYY-MM-DD)"
            value={formData.endDate}
            editable={false}
          />
          {formData.vehicleType && formData.duration && (
            <View className="mt-2">
              <Text className="text-base font-medium">
                Payment Method: {formData.paymentMethod || "Not selected"}
              </Text>
              <Text className="text-base font-medium">
                Amount: ₹{calculateAmount()}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              className="bg-red-500 py-3 px-4 rounded-sm flex-1 mr-2"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-base font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-green-600 py-3 px-4 justify-center items-center rounded-sm flex-1 ml-2"
              onPress={handleCreatePass}
            >
              {isLoading ? (
                <View className="bg-white p-2 rounded-full">
                  <ActivityIndicator size="small" color="#10B981" />
                </View>
              ) : (
                <Text className="text-center text-xl text-white font-semibold">
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ToastManager showCloseIcon={false} />
    </Modal>
  );
};

export default MonthlyPassModal;
