import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { sendOtp } from "../../redux/actions/teacherAction";
import { setUpdatePassword } from "../../redux/slices/teacherSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

export default function ResetPasswordScreen() {
  const dispatch = useDispatch();
  const Teacher = useSelector((state) => state.Teacher);
  const { updatePassword, loading } = Teacher;
  const { email } = updatePassword;

  const handleReset = async () => {
    dispatch(setUpdatePassword({ name: "isForgot", value: true }));
    await dispatch(sendOtp({ email }));
    router.replace("/auth/otp");
  };

  const onChange = (text) => {
    dispatch(setUpdatePassword({ name: "email", value: text }));
  };

  return (
    <View style={styles.container}>
      <PageHeader text="Forget Password" />

      <View style={styles.formContainer}>
        <Image
          source={require("../../assets/email.png")}
          style={styles.otpImage}
          resizeMode="contain"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => onChange(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {loading ? (
          <View style={styles.loader}>
            <Text style={{ marginTop: 10, fontSize: 16, marginRight: 20 }}>
              Loading...
            </Text>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  formContainer: {
    padding: 30,
    marginTop: 40,
    alignItems: "center", // ✅ centers horizontally
  },
  input: {
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    padding: 20,
    fontSize: 17,
    marginTop: 16,
    marginBottom: 16,
    elevation: 2,
    width: "100%", //
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    width: "100%", //
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
  otpImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
  },
});
