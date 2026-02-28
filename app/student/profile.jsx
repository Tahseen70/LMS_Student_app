import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { formatCNIC } from "../../config";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const Profile = () => {
  const router = useRouter();

  // Get teacher data from Redux
  const Student = useSelector((state) => state.Student);
  const { student } = Student;
  const {
    name = "",
    email = "",
    cnic = "",
    phoneNumber = "",
    profileUrl = "",
    isMale = false,
  } = student;

  const schoolName = student?.school?.name || "";
  const campusName = student?.campus?.name || "";

  // Safely access teacher details
  const profile = profileUrl
    ? { uri: profileUrl }
    : isMale
    ? require("../../assets/user_male.png")
    : require("../../assets/user_female.png"); // fallback image

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader
        text="Profile"
      />

      {/* Placeholder Message */}
      <ScrollView
        style={{ marginTop: 10 }}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 20 }}
      >
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image source={profile} style={styles.avatarImage} />
          <Text style={styles.teacherName}>
            {name} {isMale ? "♂️" : "♀️"}
          </Text>

          {/* School & Campus combined into a single Text node to avoid stray text nodes */}
          <Text style={styles.teacherSchool}>
            {schoolName} , {campusName} Campus
          </Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="mail-outline" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.infoText}>{email ?? "No Email"}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="call-outline" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.infoText}>{phoneNumber ?? "No Phone"}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="id-card-outline" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.infoText}>
            {cnic ? formatCNIC(cnic) : "No CNIC"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: Colors.secondaryDark,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  teacherSchool: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    width: "100%",
    padding: 15,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.quaternary,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  iconWrap: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 16,
    color: Colors.secondaryDark,
    marginLeft: 10,
  },
});
