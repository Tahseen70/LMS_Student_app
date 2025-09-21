import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import NotFoundImage from "../assets/not_found.png";
import Colors from "../styles/Colors";

const ListEmpty = ({ text }) => {
  return (
    <View style={styles.container}>
      <Image source={NotFoundImage} style={styles.image} resizeMode="contain" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 12,
  },
  text: {
    fontSize: 24,
    color: Colors.quaternary,
  },
});

export default ListEmpty;
