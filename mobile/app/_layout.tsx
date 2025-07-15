import userAuthStore from "@/utils/store";
import { Stack } from "expo-router";

export default function RootLayout() {
  const isLogged = userAuthStore((state) => state.isLogged);
  return (
    <Stack>
      <Stack.Protected guard={isLogged}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLogged}>
        <Stack.Screen name="splash" options={{headerShown: false}} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
