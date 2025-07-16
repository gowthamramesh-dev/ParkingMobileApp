import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="staffPage"
        options={{
          headerShown: true,
          title: "Account Settings",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}
