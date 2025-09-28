import React from "react";
import { StyleSheet, View } from "react-native";
import LoaderKit from "react-native-loader-kit";

const Loader = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.loaderOverlay}>
      {/* <ActivityIndicator size="large" color={Colors.primary} /> */}
      <LoaderKit
        style={{ width: 50, height: 50 }}
        name={"BallPulse"} // Optional: see list of animations below
        size={50} // Required on iOS
        color={"red"} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
      />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
