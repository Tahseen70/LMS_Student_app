import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../styles/Colors";
import { UIActivityIndicator } from "./LoaderComponents";

const Loader = ({ loading, loaderText = "" }) => {
  if (!loading) return null;

  return (
    <View style={styles.loaderOverlay}>
      <UIActivityIndicator
        style={styles.loader}
        color={Colors.tertiary}
        width={50}
        height={50}
      />
      {loaderText && <Text style={styles.loaderText}>{loaderText}</Text>}
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
  loader: {
    maxHeight: 100,
  },
  loaderText: {
    fontSize: 18,
    color: Colors.tertiary,
  },
});
