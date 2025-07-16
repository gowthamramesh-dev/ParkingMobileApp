import userAuthStore from "@/utils/store";
import { Stack } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export const useTokenValidation = () => {
  const { token, logOut } = userAuthStore();

  useEffect(() => {
    if (token) {
      const decoded: { exp?: number } = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logOut();
      }
    }
  }, [token]);
};

export default function RootLayout() {
  const isLogged = userAuthStore((state) => state.isLogged);
  const hydrated = userAuthStore((state) => state.hydrated);

  useEffect(() => {
    userAuthStore.getState().restoreSession();
  }, []);

  useTokenValidation();

  if (!hydrated) return null;

  return (
    <Stack>
      <Stack.Protected guard={isLogged}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isLogged}>
        {/* <Stack.Screen name="splash" options={{ headerShown: false }} /> */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
