import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import Axios from "../config/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function usePushNotifications({ userId }) {
  const tokenSentRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    let receivedSubscription;
    let responseSubscription;

    // =========================
    // SAFE REGISTER WRAPPER
    // =========================
    const safeRegister = async () => {
      try {
        await registerForPushNotificationsAsync();
      } catch (err) {
        console.warn("Push register failed (non-critical):", err?.message);
      }
    };

    safeRegister();

    // =========================
    // FOREGROUND LISTENER (SAFE)
    // =========================
    try {
      receivedSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          try {
            console.log(
              "Notification Received:",
              notification.request.content.data
            );
          } catch (err) {
            console.warn("Foreground handler error:", err?.message);
          }
        });
    } catch (err) {
      console.warn("Failed to attach foreground listener:", err?.message);
    }

    // =========================
    // TAP HANDLER (SAFE)
    // =========================
    try {
      responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          try {
            const data = response.notification.request.content.data;

            console.log("Notification Tapped:", data);

            if (data?.screen && router?.navigate) {
              router.navigate(data.screen);
            }
          } catch (err) {
            console.warn("Notification tap handler error:", err?.message);
          }
        });
    } catch (err) {
      console.warn("Failed to attach tap listener:", err?.message);
    }

    return () => {
      try {
        receivedSubscription?.remove?.();
        responseSubscription?.remove?.();
      } catch (err) {
        console.warn("Cleanup error:", err?.message);
      }
    };

    // =========================
    // REGISTER TOKEN
    // =========================
    async function registerForPushNotificationsAsync() {
      try {
        if (!Device.isDevice) {
          console.warn("Push works only on physical devices");
          return;
        }

        let finalStatus = (await Notifications.getPermissionsAsync())?.status;

        if (finalStatus !== "granted") {
          const { status } =
            await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.warn("Push permission denied");
          return;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          console.warn("Missing Expo projectId");
          return;
        }

        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        console.log("Expo Push Token:", token);

        if (!tokenSentRef.current && token) {
          tokenSentRef.current = true;
          await sendTokenToServer(token);
        }
      } catch (err) {
        console.warn("Token registration failed:", err?.message);
      }
    }

    // =========================
    // SEND TO BACKEND
    // =========================
    async function sendTokenToServer(token) {
      try {
        if (!token) return;

        const formData = new FormData();
        formData.append("platform", String(Platform.OS));
        formData.append("expoPushToken", String(token));

        await Axios.post("subscriptions/student", formData, {
          timeout: 8000, // 👈 prevents hanging requests
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Token saved");
      } catch (err) {
        console.warn(
          "Token save failed (non-critical):",
          err?.response?.data || err?.message
        );
      }
    }
  }, [userId]);
}