import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "../styles/Colors";

const Loader = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.loaderOverlay}>
      <ActivityIndicator size="large" color={Colors.primary} />
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
