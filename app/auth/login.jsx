import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { hexToRgba, isValidEmail } from "../../config";
import { loginStudent, loginToken } from "../../redux/actions/studentAction";
import { setSchool } from "../../redux/slices/schoolSlice";
import { setStudent } from "../../redux/slices/studentSlice";
import { resetUpdatePassword } from "../../redux/slices/teacherSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const Student = useSelector((state) => state.Student);
  const { student, email, password, loading } = Student;

  const School = useSelector((state) => state.School);
  const { selectedSchool } = School;
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) setHasToken(true);

        if (student) router.replace("/teacher/home");

        const campus = await AsyncStorage.getItem("school");

        if (campus && !selectedSchool) {
          let parsedCampus = null;
          try {
            parsedCampus = JSON.parse(campus);
          } catch (err) {
            console.warn("Invalid campus JSON:", campus);
          }

          if (parsedCampus) {
            const currentSchool = parsedCampus.school;

            if (currentSchool) {
              dispatch(
                setSchool({
                  name: "selectedSchool",
                  value: currentSchool,
                })
              );
            }

            dispatch(
              setSchool({
                name: "selectedCampus",
                value: parsedCampus,
              })
            );
          }
        }
      } catch (e) {
        console.error("Error checking token", e);
      }
    })();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing Credentials",
        "Please enter both email and password."
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid Email", "Please enter valid email");
      return;
    }

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const resultAction = await dispatch(loginStudent({ email, password }));
    if (loginStudent.fulfilled.match(resultAction)) {
      router.replace("/teacher/home");
    }
    if (loginStudent.rejected.match(resultAction)) {
      Alert.alert("Error Occured", String(resultAction.payload));
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert(
          "Error",
          "Biometric authentication not supported on this device."
        );
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert("Error", "No biometrics are enrolled on this device.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Biometrics",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        const resultAction = await dispatch(loginToken());
        if (loginToken.fulfilled.match(resultAction)) {
          router.replace("/teacher/home");
        }
        if (loginToken.rejected.match(resultAction)) {
          Alert.alert("Error Occured", String(resultAction.payload));
        }
      } else {
        Alert.alert("Authentication failed", result.error || "Try again");
      }
    } catch (e) {
      console.error("Biometric error", e);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const onChange = (e) => {
    const { name, value } = e;
    dispatch(setStudent({ name, value }));
  };

  const onCloseClick = async () => {
    await AsyncStorage.clear();
    router.replace("/auth/splash");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            ...styles.container,
            height: "100%",
          }}
        >
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCloseClick}
              >
                <View style={styles.closeCircle}>
                  <Ionicons name="close" size={20} color={Colors.tertiary} />
                </View>
              </TouchableOpacity>
              <Image
                source={
                  selectedSchool?.logoUrl
                    ? { uri: selectedSchool.logoWhiteUrl }
                    : require("../../assets/Logo_White.png")
                }
                style={styles.logo}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your details below</Text>

            <TextInput
              placeholder="Enter Email"
              placeholderTextColor={hexToRgba(Colors.secondary, 0.7)}
              style={styles.input}
              value={email}
              onChangeText={(text) => onChange({ name: "email", value: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Enter Password"
                placeholderTextColor={hexToRgba(Colors.secondary, 0.7)}
                style={[
                  styles.input,
                  { flex: 1, borderWidth: 0, marginBottom: 0 },
                ]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) =>
                  onChange({ name: "password", value: text })
                }
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={Colors.secondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                dispatch(resetUpdatePassword());
                router.push("/auth/forgetpassword");
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
              >
                <View style={styles.loginGradient}>
                  <Text style={styles.loginText}>Sign in</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {hasToken && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={styles.biometricButton}
              >
                <Ionicons
                  name="finger-print"
                  size={40}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  ...ContainerStyles,
  header: {
    height: "35%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.primary,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 180,
    zIndex: 10,
  },
  closeCircle: {
    backgroundColor: "red",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  graderlogo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.tertiary,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginTop: -40,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: Colors.secondaryDark,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: Colors.secondary,
    textAlign: "right",
    marginBottom: 15,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  loginButton: {
    marginVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loginGradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: { color: Colors.tertiary, fontWeight: "bold", fontSize: 16 },
  biometricButton: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
