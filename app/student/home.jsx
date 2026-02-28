import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BackHandler, Image } from "react-native";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { hexToRgba } from "../../config";
import Colors from "../../styles/Colors";

const dashboardItems = [
  {
    id: "1",
    title: "Attendance",
    icon: "calendar-number-outline",
    route: "/student/attendance",
  },
  {
    id: "2",
    title: "Class Schedule",
    icon: "calendar-outline",
    route: "/student/schedule",
  },
  {
    id: "3",
    title: "Marks",
    icon: "school-outline",
    route: "/student/marks",
  },
  {
    id: "4",
    title: "Notes",
    icon: "document-text-outline",
    route: "/student/notes",
  },
];

const Home = () => {
  const router = useRouter();
  // Close App on Hardware Back Button Press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp(); // instantly close app
        return true;
      };

      // ✅ Subscribe
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      // ✅ Unsubscribe correctly
      return () => subscription.remove();
    }, [])
  );

  const renderDashboardItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.8}
      style={styles.card} // outer container
      onPress={() => item.route && router.push({ pathname: item.route, params: { from: "home" } })}
    >
      <View
        style={styles.cardGradient} // outer gradient
      >
        {/* Inner container */}
        <View style={styles.innerContainer}>
          <Ionicons name={item.icon} size={32} color={Colors.tertiary} />
        </View>

        <Text style={styles.cardText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  const Student = useSelector((state) => state.Student);
  const student = Student.student;
  const profileUrl = student?.profileUrl
    ? { uri: student.profileUrl }
    : student.isMale
    ? require("../../assets/user_male.png")
    : require("../../assets/user_female.png");
  const studentName = student.name;
  const schoolName = student?.school?.name || "";
  const campusName = student?.campus?.name || "";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.tertiaryLight }}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <View style={styles.avatarCircle}>
          <Image
            source={profileUrl} // 👈 put your teacher image here
            style={styles.avatarImage}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.greeting}>Good Morning, Student</Text>
          <Text style={styles.bannerText}>{studentName}</Text>
          <Text style={styles.bannerSubtitle}>
            {schoolName}, {campusName} Campus
          </Text>
        </View>
      </View>

      {/* Welcome Tile (with animation, overlapping header) */}
      <Animated.View
        style={[styles.welcomeTile, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.welcomeIcon}>
          <Image
            source={require("../../assets/logo.png")} // 👈 put your welcome image here
            style={styles.welcomeImage}
          />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Grader LMS, your study partner.
          </Text>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }} // pushes content below header + tile
      >
        {/* Dashboard Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            {renderDashboardItem({ item: dashboardItems[0] })}
            {renderDashboardItem({ item: dashboardItems[1] })}
          </View>
          <View style={styles.row}>
            {renderDashboardItem({ item: dashboardItems[2] })}
            {renderDashboardItem({ item: dashboardItems[3] })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  welcomeTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    elevation: 6,
    shadowColor: Colors.quaternary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "relative",
    top: -20,
    left: 0,
    right: 0,
    zIndex: 20,
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  welcomeIcon: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: hexToRgba(Colors.primary, 0.1),
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryDark,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
  },

  headerContainer: {
    paddingHorizontal: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 50,
  },
  headerRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: Colors.tertiary,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  bannerText: {
    color: Colors.tertiary,
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },
  bannerSubtitle: {
    color: Colors.tertiary,
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
  },

  gridContainer: {
    paddingHorizontal: 15,
    // marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48%", // outer size
    aspectRatio: 1,
    borderRadius: 25, // outer radius
    elevation: 4,
    backgroundColor: Colors.tertiary,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  cardGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingBottom: 10,
  },
  innerContainer: {
    width: "35%", // inner size (you can adjust this)
    height: "35%",
    borderRadius: 16, // inner radius
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8, // space between icon + text
    elevation: 2,
  },
  cardText: {
    marginTop: 4,
    fontSize: 14,
    textAlign: "center",
    color: Colors.primaryDark,
    fontWeight: "bold",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // makes it circular
  },

  welcomeImage: {
    width: 75,
    height: 120,
    resizeMode: "contain",
  },
});
