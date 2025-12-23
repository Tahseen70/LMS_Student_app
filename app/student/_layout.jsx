import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Fragment } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { hexToRgba } from "../../config";
import Colors from "../../styles/Colors";

const TeacherLayout = () => {
  const Student = useSelector((state) => state.Student);
  const { student, loaderText } = Student;
  const insets = useSafeAreaInsets();
  const globalLoading = useSelector((state) =>
    // check every slice in the state tree:
    Object.values(state).some(
      (slice) => slice && typeof slice === "object" && slice.loading
    )
  );
  // Redirect to login if user is not authenticated
  if (!student) return <Redirect href="/auth/login" />;

  return (
    <Fragment>
      <Loader loading={globalLoading} loaderText={loaderText} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: hexToRgba(Colors.secondary, 0.8),
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
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 1 },
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: "Attendance",
            tabBarLabel: "Attendance",
            tabBarIcon: ({ color }) => (
              <Ionicons name="calendar-number" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="marks"
          options={{
            title: "Marks",
            tabBarLabel: "Marks",
            tabBarIcon: ({ color }) => (
              <Ionicons name="school" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarLabel: "More",
            tabBarIcon: ({ color }) => (
              <Ionicons name="menu" size={26} color={color} />
            ),
          }}
        />

        {/* Hidden Routes */}
        <Tabs.Screen name="fees" options={{ href: null }} />
        <Tabs.Screen name="diary" options={{ href: null }} />
        <Tabs.Screen name="notes" options={{ href: null }} />
        <Tabs.Screen name="schedule" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </Fragment>
  );
};

export default TeacherLayout;
