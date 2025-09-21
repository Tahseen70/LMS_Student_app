import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Colors from "../styles/Colors";
import styles from "../styles/HeaderStyles";

const PageHeader = ({ text="" }) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.tertiary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{text}</Text>
      </View>
    </View>
  );
};

export default PageHeader;
