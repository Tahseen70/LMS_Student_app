import * as NavigationBar from "expo-navigation-bar";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { AppState, Platform, View } from "react-native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../redux/store";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      const applyNavConfig = async () => {
        try {
          // Always visible, solid color
          await NavigationBar.setVisibilityAsync("visible");
          await NavigationBar.setStyle("dark");
        } catch (e) {
          console.log("NavigationBar config failed", e);
        }
      };

      applyNavConfig();

      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") applyNavConfig();
      });

      return () => subscription.remove();
    }
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}
