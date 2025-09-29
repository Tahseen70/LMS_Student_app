import React from "react";
import { StyleSheet, View } from "react-native";
import Colors from "../styles/Colors";
import { UIActivityIndicator } from "./LoaderComponents";

const Loader = ({ loading }) => {
  if (!loading) return null;

  return (
    <View style={styles.loaderOverlay}>
      <UIActivityIndicator color={Colors.primary} width={50} height={50} />
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
