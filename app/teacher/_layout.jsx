import { FontAwesome } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { hexToRgba } from "../../config";
import Colors from "../../styles/Colors";

export default function TeacherLayout() {
  const Teacher = useSelector((state) => state.Teacher);
  const { teacher } = Teacher;
  const insets = useSafeAreaInsets();

  // Redirect to login if user is not authenticated
  if (!teacher) return <Redirect href="/auth/splash" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: hexToRgba(Colors.secondary,0.8),
        tabBarHideOnKeyboard: true, // ✅ Prevents keyboard jump
        tabBarSafeAreaInset: { bottom: 0 }, // ✅ Prevents bottom jump
        tabBarStyle: {
          position: "relative",
          left: 0,
          right: 0,
          bottom: 0, // ✅ adds correct padding
          height: 55 + insets.bottom, // ✅ extend height so it sits above nav bar
          // paddingBottom: 55 + insets.bottom,
          backgroundColor: Colors.tertiaryLight,
          borderTopWidth: 0,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarLabel: "Attendance",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar-check-o" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marks"
        options={{
          title: "Marks",
          tabBarLabel: "Marks",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="graduation-cap" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarLabel: "More",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bars" size={26} color={color} />
          ),
        }}
      />

      {/* Hidden Routes */}
      <Tabs.Screen name="fees" options={{ href: null }} />
      <Tabs.Screen name="notes" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
