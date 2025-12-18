import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
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
const { height: screenHeight } = Dimensions.get("screen");
const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const Student = useSelector((state) => state.Student);
  const { student, email, password, loading } = Student;

  const School = useSelector((state) => state.School);
  const { selectedSchool } = School;
  const [hasBiometric, setHasBiometric] = useState(false);
  const [biometricType, setBiometricType] = useState(0);
  const passwordRef = useRef(null);
  const heightAnim = useRef(new Animated.Value(screenHeight)).current;
  const radiusAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const compatible = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (enrolled && compatible) {
            setHasBiometric(true);
            const types =
              await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (
              types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
            ) {
              setBiometricType(1);
            } else if (
              types.includes(
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
              ) ||
              types.includes(LocalAuthentication.AuthenticationType.IRIS)
            ) {
              setBiometricType(2);
            } else {
              setHasBiometric(false);
            }
          } else {
            setHasBiometric(false);
          }
        }

        if (student) router.replace("/student/home");

        Animated.parallel([
          Animated.timing(heightAnim, {
            toValue: screenHeight * 0.35,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(radiusAnim, {
            toValue: 30, // final radius
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            delay: 100,
            useNativeDriver: true, // ✅ REQUIRED for opacity
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 800,
            delay: 100,
            useNativeDriver: true,
          }),
        ]).start();
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
      router.replace("/student/home");
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
          router.replace("/student/home");
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
          <Animated.View
            style={[
              styles.header,
              {
                height: heightAnim,
                borderBottomLeftRadius: radiusAnim,
                borderBottomRightRadius: radiusAnim,
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={
                  selectedSchool?.logoUrl
                    ? { uri: selectedSchool.logoWhiteUrl }
                    : require("../../assets/logo_round_white.png")
                }
                style={styles.logo}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: opacityAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
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
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
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
                returnKeyType="done"
                submitBehavior="blurAndSubmit" // default, but explicit
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  handleLogin();
                }}
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

            {hasBiometric && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={styles.biometricButton}
              >
                {biometricType === 1 ? (
                  <Ionicons
                    name={"finger-print"}
                    size={40}
                    color={Colors.primary}
                  />
                ) : (
                  <View style={styles.faceIconContainer}>
                    <Ionicons
                      name="scan-outline"
                      size={50}
                      color={Colors.primary}
                    />
                    <Ionicons
                      name="happy-outline"
                      size={30}
                      color={Colors.primary}
                      style={styles.faceIcon}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  ...ContainerStyles,
  header: {
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 3,
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
  // IOS Styles
  faceIconContainer: {
    position: "relative",
    width: 50,
    height: 50,
  },
  faceIcon: { position: "absolute", top: 10, left: 10 },
});
