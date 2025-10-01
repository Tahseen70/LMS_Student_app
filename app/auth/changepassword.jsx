import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { changePassword } from "../../redux/actions/teacherAction";
import { setUpdatePassword } from "../../redux/slices/teacherSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const ChangePasswordScreen = () => {
  const dispatch = useDispatch();
  const Teacher = useSelector((state) => state.Teacher);
  const { updatePassword, loading } = Teacher;
  const { isForgot, newPassword, confirmPassword, email, otp } = updatePassword;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const otpStr = otp.join("");
    const changePasswordResult = await dispatch(
      changePassword({ otp: otpStr, email, password: newPassword })
    );

    if (changePassword.fulfilled.match(changePasswordResult)) {
      if (isForgot) {
        router.replace("/auth/login");
      } else {
        router.replace("/student/more");
      }
    }
  };

  const onChange = (name, value) => {
    dispatch(setUpdatePassword({ name, value }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader text="Reset Password" />

      {/* Form */}
      <View style={styles.formContainer}>
        <Image
          source={require("../../assets/lock.png")}
          style={styles.otpImage}
          resizeMode="contain"
        />
        {/* New Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={(text) => onChange("newPassword", text)}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword((prev) => !prev)}
          >
            <Ionicons
              name={showNewPassword ? "eye-off" : "eye"}
              size={22}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => onChange("confirmPassword", text)}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={22}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Button / Loader */}

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  formContainer: {
    padding: 30,
    marginTop: 40,
    alignItems: "center",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    color: Colors.secondaryDark,
  },
  eyeIcon: { paddingHorizontal: 5 },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    width: "100%",
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  resetButtonText: {
    color: Colors.tertiary,
    fontSize: 16,
    fontWeight: "bold",
  },

  loader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  loaderText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.secondaryDark,
  },
  otpImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 30,
  },
});

export default ChangePasswordScreen;
