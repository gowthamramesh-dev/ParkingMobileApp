import {
  Dimensions,
  Text,
  View,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ProgressChart, PieChart } from "react-native-chart-kit";
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
  const types = Object.keys(dataObject || {});
  const counts = Object.values(dataObject || {}) as number[];

  const labels = types.map((type, i) => `${counts[i] || 0} ${type}`);

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

const PieChartSection = ({ title, data }: { title: string; data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No data available</Text>
      </View>
    );
  }
  return (
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
        <PieChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </LinearGradient>
    </Animated.View>
  );
};

const TodayReport = () => {
  const {
    hydrated,
    getDashboardData,
    checkins,
    checkouts,
    allData,
    VehicleTotalMoney,
    PaymentMethod,
    staffData,
    transactionLogs,
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
  const [paymentMethod, setPaymentMethod] = useState<
    { method: string; amount: number }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getDashboardData();
    setRefreshing(false);
  }, [getDashboardData]);

  useEffect(() => {
    if (hydrated) {
      getDashboardData();
    }
  }, [hydrated, getDashboardData]);

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
        amount: Number(amount) || 0,
      })
    );

    setVehicleList(updatedVehicleList);
    setPaymentMethod(paymentList);
  }, [checkins, checkouts, allData, VehicleTotalMoney, PaymentMethod]);

  const revenueChartData = useMemo(() => {
    return Object.entries(VehicleTotalMoney || {}).map(
      ([type, money], index) => ({
        name: type,
        population: Number(money) || 0,
        color: `hsl(${index * 60}, 70%, 50%)`,
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      })
    );
  }, [VehicleTotalMoney]);

  const staffChartData = useMemo(() => {
    return (staffData || []).map((staff, index) => ({
      name: staff.username || "Unknown",
      population: staff.checkIns || 0,
      color: `hsl(${index * 60}, 70%, 50%)`,
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    }));
  }, [staffData]);

  return (
    <LinearGradient colors={["#f3f4f6", "#e5e7eb"]} className="flex-1">
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="my-4 mx-4 bg-white rounded-xl justify-center items-center py-5 shadow-md shadow-gray-200/50"
      >
        <Text className="text-2xl font-extrabold text-gray-900">
          Admin Dashboard
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
            <PieChartSection
              title="Revenue by Vehicle"
              data={revenueChartData}
            />
            <PieChartSection title="Staff Check-Ins" data={staffChartData} />
          </ScrollView>
        </View>

        {/* Vehicles Table */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="bg-white mx-4 rounded-xl shadow-md shadow-gray-200/50 mb-4"
        >
          <View className="p-4 flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-gray-800">Vehicles</Text>
          </View>
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
        </Animated.View>

        {/* Payment Methods Table */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="bg-white mx-4 rounded-xl shadow-md shadow-gray-200/50 mb-4"
        >
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
              No payment data available
            </Text>
          )}
        </Animated.View>

        {/* Staff Performance Table */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(600)}
          className="bg-white mx-4 rounded-xl shadow-md shadow-gray-200/50 mb-4"
        >
          <View className="p-4 flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-gray-800">
              Staff Performance
            </Text>
          </View>
          {Array.isArray(staffData) && staffData.length > 0 ? (
            <FlatList
              data={staffData}
              keyExtractor={(item) => item.username}
              ListHeaderComponent={() => (
                <View className="flex-row justify-around bg-green-100 py-3 border-b border-gray-200 mx-2 rounded-t-lg">
                  <Text className="w-1/4 text-center font-extrabold text-gray-800">
                    Staff
                  </Text>
                  <Text className="w-1/4 text-center font-extrabold text-gray-800">
                    Check-Ins
                  </Text>
                  <Text className="w-1/4 text-center font-extrabold text-gray-800">
                    Check-Outs
                  </Text>
                  <Text className="w-1/4 text-center font-extrabold text-gray-800">
                    Revenue
                  </Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(index * 100)}
                  className="flex-row justify-around py-3 border-b border-gray-100 mx-2"
                >
                  <Text className="w-1/4 text-center text-gray-700 font-medium">
                    {item.username || "Unknown"}
                  </Text>
                  <Text className="w-1/4 text-center text-gray-700 font-medium">
                    {item.checkIns || 0}
                  </Text>
                  <Text className="w-1/4 text-center text-gray-700 font-medium">
                    {item.checkOuts || 0}
                  </Text>
                  <Text className="w-1/4 text-center text-green-600 font-medium">
                    ₹{item.revenue || 0}
                  </Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text className="text-center p-4 text-gray-500 font-medium">
              No staff data available
            </Text>
          )}
        </Animated.View>

        {/* Transaction Logs Table */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(800)}
          className="bg-white mx-4 rounded-xl shadow-md shadow-gray-200/50 mb-4"
        >
          <View className="p-4 flex-1 justify-center items-center">
            <Text className="text-xl font-bold text-gray-800">
              Transaction Logs
            </Text>
          </View>
          {Array.isArray(transactionLogs) && transactionLogs.length > 0 ? (
            <ScrollView horizontal>
              <View>
                <View className="flex-row bg-green-100 py-3 border-b border-gray-200">
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    ID
                  </Text>
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    Type
                  </Text>
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    Vehicle
                  </Text>
                  <Text className="w-32 text-center font-extrabold text-gray-800">
                    Time
                  </Text>
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    Staff
                  </Text>
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    Amount
                  </Text>
                  <Text className="w-20 text-center font-extrabold text-gray-800">
                    Payment
                  </Text>
                </View>
                <FlatList
                  data={transactionLogs}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      entering={FadeInDown.duration(400).delay(index * 100)}
                      className="flex-row py-3 border-b border-gray-100"
                    >
                      <Text className="w-20 text-center text-gray-700 font-medium">
                        {item.id}
                      </Text>
                      <Text className="w-20 text-center text-gray-700 font-medium">
                        {item.type}
                      </Text>
                      <Text className="w-20 text-center text-gray-700 font-medium">
                        {item.vehicleType || "N/A"}
                      </Text>
                      <Text className="w-32 text-center text-gray-700 font-medium">
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </Text>
                      <Text className="w-20 text-center text-gray-700 font-medium">
                        {item.staff || "Unknown"}
                      </Text>
                      <Text className="w-20 text-center text-green-600 font-medium">
                        ₹{item.amount || 0}
                      </Text>
                      <Text className="w-20 text-center text-gray-700 font-medium">
                        {item.paymentMethod || "N/A"}
                      </Text>
                    </Animated.View>
                  )}
                />
              </View>
            </ScrollView>
          ) : (
            <Text className="text-center p-4 text-gray-500 font-medium">
              No transaction logs available
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default TodayReport;
