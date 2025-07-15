import {
  Dimensions,
  Text,
  View,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { ProgressChart } from "react-native-chart-kit";
import userAuthStore from "@/utils/store";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth * 0.95;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    stroke: "#e0e0e0",
  },
};

const prepareChartData = (dataObject: any) => {
  const types = Object.keys(dataObject);
  const counts = Object.values(dataObject) as number[];

  const labels = types.map((type, i) => `${counts[i]} ${type}`);

  const max = Math.max(...counts, 1);
  const normalizedData = counts.map((count) => count / max);

  return {
    labels,
    data: normalizedData,
  };
};

const ChartSection = ({ title, data }: any) => (
  <Animated.View
    entering={FadeInDown.duration(500)}
    style={{
      width: screenWidth,
      alignItems: "center",
      paddingVertical: 12,
    }}
  >
    <Text className="text-xl font-bold text-gray-800 mb-4">{title}</Text>
    <LinearGradient
      colors={["#f0fdf4", "#dcfce7"]}
      className="rounded-xl p-4 shadow-lg shadow-green-200/50"
    >
      <ProgressChart
        data={prepareChartData(data)}
        width={chartWidth}
        height={220}
        strokeWidth={14}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
      />
    </LinearGradient>
  </Animated.View>
);

const TodayReport = () => {
  const {
    hydrated,
    getTodayVehicles,
    checkins,
    checkouts,
    allData,
    VehicleTotalMoney,
    PaymentMethod,
  } = userAuthStore();

  const [vehicleList, setVehicleList] = useState<
    {
      vehicle: string;
      checkin: number;
      checkout: number;
      total: number;
      money: number;
    }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getTodayVehicles();
    setRefreshing(false);
  }, [getTodayVehicles]);

  useEffect(() => {
    if (hydrated) {
      getTodayVehicles();
    }
  }, [hydrated]);

  useEffect(() => {
    const vehicleTypes = Array.from(
      new Set([
        ...Object.keys(checkins || {}),
        ...Object.keys(checkouts || {}),
        ...Object.keys(allData || {}),
        ...Object.keys(VehicleTotalMoney || {}),
      ])
    );

    const updatedVehicleList = vehicleTypes.map((type) => ({
      vehicle: type,
      checkin: checkins?.[type] || 0,
      checkout: checkouts?.[type] || 0,
      total: allData?.[type] || 0,
      money: VehicleTotalMoney?.[type] || 0,
    }));

    const paymentList = Object.entries(PaymentMethod || {}).map(
      ([method, amount]) => ({
        method,
        amount,
      })
    );

    setVehicleList(updatedVehicleList);
    setPaymentMethod(paymentList);
  }, [checkins, checkouts, allData, VehicleTotalMoney, PaymentMethod]);

  return (
    <LinearGradient colors={["#f3f4f6", "#e5e7eb"]} className="flex-1">
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="my-4 mx-4 bg-white rounded-xl justify-center items-center py-5 shadow-md shadow-gray-200/50"
      >
        <Text className="text-2xl font-extrabold text-gray-900">
          Today's Report
        </Text>
      </Animated.View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="pb-6">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <ChartSection title="All Vehicles" data={allData} />
            <ChartSection title="Check In" data={checkins} />
            <ChartSection title="Check Out" data={checkouts} />
          </ScrollView>
        </View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="bg-white mx-4 rounded-xl shadow-md shadow-gray-200/50"
        >
          <View className="p-4 flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-gray-800">Vehicles</Text>
          </View>
          <View className="pb-4">
            {Array.isArray(vehicleList) && vehicleList.length > 0 ? (
              <FlatList
                data={vehicleList}
                keyExtractor={(item) => item.vehicle}
                ListHeaderComponent={() => (
                  <View className="flex-row justify-around bg-green-100 py-3 border-b border-gray-200 mx-2 rounded-t-lg">
                    <Text className="w-1/5 text-center font-extrabold text-gray-800">
                      Vehicle
                    </Text>
                    <Text className="w-1/5 text-center font-extrabold text-gray-800">
                      IN
                    </Text>
                    <Text className="w-1/5 text-center font-extrabold text-gray-800">
                      Out
                    </Text>
                    <Text className="w-1/5 text-center font-extrabold text-gray-800">
                      All
                    </Text>
                    <Text className="w-1/5 text-center font-extrabold text-gray-800">
                      Money
                    </Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    className="flex-row justify-around py-3 border-b border-gray-100 mx-2"
                  >
                    <Text className="w-1/5 text-center text-gray-700 font-medium">
                      {item.vehicle}
                    </Text>
                    <Text className="w-1/5 text-center text-gray-700 font-medium">
                      {item.checkin}
                    </Text>
                    <Text className="w-1/5 text-center text-gray-700 font-medium">
                      {item.checkout}
                    </Text>
                    <Text className="w-1/5 text-center text-gray-700 font-medium">
                      {item.total}
                    </Text>
                    <Text className="w-1/5 text-center text-green-600 font-medium">
                      ₹{item.money}
                    </Text>
                  </Animated.View>
                )}
              />
            ) : (
              <Text className="text-center p-4 text-gray-500 font-medium">
                No vehicle data available
              </Text>
            )}
          </View>
          <View>
            <View className="p-4 flex-1 justify-center items-center">
              <Text className="text-xl font-bold text-gray-800">
                Payment Methods
              </Text>
            </View>
            {Array.isArray(paymentMethod) && paymentMethod.length > 0 ? (
              <FlatList
                data={paymentMethod}
                keyExtractor={(item) => item.method}
                ListHeaderComponent={() => (
                  <View className="flex-row justify-around bg-green-100 py-3 border-b border-gray-200 mx-2 rounded-t-lg">
                    <Text className="w-1/2 text-center font-extrabold text-gray-800">
                      Payment
                    </Text>
                    <Text className="w-1/2 text-center font-extrabold text-gray-800">
                      Money
                    </Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    className="flex-row justify-around py-3 border-b border-gray-100 mx-2"
                  >
                    <Text className="w-1/2 text-center text-gray-700 font-medium">
                      {item.method}
                    </Text>
                    <Text className="w-1/2 text-center text-green-600 font-medium">
                      ₹{item.amount}
                    </Text>
                  </Animated.View>
                )}
              />
            ) : (
              <Text className="text-center p-4 text-gray-500 font-medium">
                No payment data
              </Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default TodayReport;
