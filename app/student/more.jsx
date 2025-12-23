import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { hexToRgba } from "../../config";
import { resetState } from "../../redux/actions/globalAction";
import { sendOtp } from "../../redux/actions/teacherAction";
import {
  resetUpdatePassword,
  setUpdatePassword,
} from "../../redux/slices/teacherSlice";
import Colors from "../../styles/Colors";

const More = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const Student = useSelector((state) => state.Student);
  const { student } = Student;
  const schoolName = student?.school?.name || "";
  const campusName = student?.campus?.name || "";

  const profileUrl = student?.profileUrl
    ? { uri: student.profileUrl }
    : student.isMale
    ? require("../../assets/user_male.png")
    : require("../../assets/user_female.png");

  const logout = () => {
    dispatch(resetState());
    router.replace("/auth/login");
  };

  const setUpdateEmail = async () => {
    dispatch(resetUpdatePassword());
    const email = student.email;
    dispatch(setUpdatePassword({ name: "email", value: email }));
    await dispatch(sendOtp({ email }));
    dispatch(setUpdatePassword({ name: "isForgot", value: false }));
  };

  const colors = {
    background: Colors.tertiary,
    text: Colors.quaternary,
    card: hexToRgba(Colors.tertiaryDark, 0.3),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ✅ Transparent StatusBar with overlay effect */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Image source={profileUrl} style={styles.picture} />
          </View>
          <View>
            <Text style={[styles.nameText, { color: colors.text }]}>
              {student.name}
            </Text>
            <Text style={{ color: colors.text }}>
              {schoolName} , {campusName}
            </Text>
          </View>
        </View>

        {/* Sections */}
        <Section
          title="General"
          colors={colors}
          items={[
            {
              label: "Profile",
              route: "/student/profile",
              icon: "notifications-outline",
            },
            {
              label: "Notes",
              route: "/student/notes",
              icon: "document-text-outline",
            },
            {
              label: "Class Schedule",
              route: "/student/schedule",
              icon: "calendar-outline",
            },
            {
              label: "Fees",
              route: "/student/fees",
              icon: "card-outline",
            },
            {
              label: "Diary",
              route: "/student/diary",
              icon: "book-outline",
            },
          ]}
        />

        <Section
          title="Profile"
          colors={colors}
          items={[
            {
              label: "Change Password",
              action: setUpdateEmail,
              route: "/auth/otp",
              icon: "lock-closed-outline",
            },
          ]}
        />

        <Section
          title="Resources"
          colors={colors}
          items={[{ label: "Logout", action: logout, icon: "log-out-outline" }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ title, items, colors }) => {
  const router = useRouter();

  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: Colors.primaryDark }]}>
        {title}
      </Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.itemButton, { backgroundColor: colors.card }]}
          onPress={() => {
            if (item.action) item.action();
            if (item.route) router.push(item.route);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {item.icon && (
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            )}
            <Text style={[styles.itemText, { color: colors.text }]}>
              {item.label}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 16,
    minHeight: "100%",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
  },
  picture: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: "cover",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  itemButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 18,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});

export default More;
