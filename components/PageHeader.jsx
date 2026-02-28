import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Colors from "../styles/Colors";
import styles from "../styles/HeaderStyles";

const PageHeader = ({ text = "", onBack }) => {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const onBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      if (from === "more") {
        router.navigate("/student/more");
      } else if (from === "home") {
        router.navigate("/student/home");
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.navigate("/student/home");
      }
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.tertiary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{text}</Text>
      </View>
    </View>
  );
};

export default PageHeader;
