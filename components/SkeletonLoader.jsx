import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import Colors from "../styles/Colors";
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SkeletonLoader = ({ number = 1, style = {}, containerStyle = {} }) => {
  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      {[...Array(number)].map((_, index) => (
        <ShimmerPlaceholder
          style={{ ...styles.shimmer, ...style }}
          key={index}
        ></ShimmerPlaceholder>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  shimmer: {
    width: "100%",
    height: 60,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    opacity: 0.3,
    marginTop: 16,
  },
});

export default SkeletonLoader;
