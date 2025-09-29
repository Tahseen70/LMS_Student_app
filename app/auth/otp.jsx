import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { checkOtp, sendOtp } from "../../redux/actions/teacherAction";
import { setUpdatePassword } from "../../redux/slices/teacherSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const ResetPasswordScreen = () => {
  const dispatch = useDispatch();
  const inputs = useRef([]);
  const Teacher = useSelector((state) => state.Teacher);
  const { updatePassword, loading } = Teacher;
  const { otp = ["", "", "", ""], email } = updatePassword;
  const TIMER_DURATION = 60;
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [showOtp, setShowOtp] = useState(false);

  const setOtp = (value) => {
    dispatch(
      setUpdatePassword({
        name: "otp",
        value,
      })
    );
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) {
      Alert.alert("Error", "Please enter a 4-digit OTP");
      return;
    }
    const otpStr = otp.join("");
    const otpCheckResult = await dispatch(checkOtp({ otp: otpStr, email }));
    if (checkOtp.fulfilled.match(otpCheckResult)) {
      router.replace("/auth/changepassword");
    } else if (checkOtp.rejected.match(otpCheckResult)) {
      const message = otpCheckResult.payload || "Error Ocuured";
      Alert.alert("Error", message);
    }
  };

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputs.current[index - 1].focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    const otpResult = await dispatch(sendOtp({ email }));
    if (sendOtp.fulfilled.match(otpResult)) {
      Alert.alert("OTP Sent", "A new verification code has been sent.");
      setTimer(TIMER_DURATION);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader text="Enter OTP" />

      <View style={styles.formContainer}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/robot.png")}
            style={styles.otpImage}
            resizeMode="contain"
          />
        </View>

        {/* Title + Subtitle */}
        <Text style={styles.otpTitle}>OTP Verification</Text>
        <Text style={styles.otpSubtitle}>
          We have sent a one-time password (OTP) to your email:{"\n"}
          {email && (
            <Text style={{ fontWeight: "bold", color: Colors.primary }}>
              {email}
            </Text>
          )}
        </Text>
        {/* OTP input + Eye icon */}
        <View style={otpStyles.wrapper}>
          <View style={otpStyles.container}>
            {otp.map((value, index) => (
              <TextInput
                key={index}
                style={otpStyles.input}
                keyboardType="numeric"
                maxLength={1}
                secureTextEntry={!showOtp}
                value={value}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                ref={(ref) => (inputs.current[index] = ref)}
              />
            ))}
          </View>
          <TouchableOpacity
            style={otpStyles.eyeButton}
            onPress={() => setShowOtp((prev) => !prev)}
          >
            <Ionicons
              name={showOtp ? "eye-off" : "eye"}
              size={28}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Resend section */}
        {timer > 0 ? (
          <Text style={styles.timerText}>
            Resend - 00:{timer < 10 ? `0${timer}` : timer}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        )}

        {/* Loader / Button */}

        <TouchableOpacity style={styles.resetButton} onPress={handleSubmit}>
          <Text style={styles.resetButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  formContainer: { padding: 30, marginTop: 40 },
  imageContainer: {
    alignItems: "center", // ✅ centers horizontally
    justifyContent: "center",
    marginBottom: 20,
  },
  otpImage: {
    width: 150,
    height: 150,
    alignSelf: "center", // ✅ ensures image itself is centered
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.quaternary,
    textAlign: "center",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  timerText: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    color: Colors.secondary,
  },
  resendText: {
    textAlign: "center",
    marginBottom: 15,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
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
  },
});

const otpStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  container: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    width: 60,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    textAlign: "center",
    fontSize: 36,
    backgroundColor: Colors.tertiary,
  },
  eyeButton: {
    marginLeft: 15,
  },
});

export default ResetPasswordScreen;
