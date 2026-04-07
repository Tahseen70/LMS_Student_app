// VideoModal.js
import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../styles/Colors";

const VideoModal = ({ visible, videoUrl, onClose }) => {
  const [videoRef, setVideoRef] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const { width, height } = dimensions;

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <Video
          ref={(ref) => setVideoRef(ref)}
          source={{ uri: videoUrl }}
          style={{ width, height: width * (9 / 16) }} // 16:9 ratio
          resizeMode="contain"
          useNativeControls
          shouldPlay
        />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={40} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
});

export default VideoModal;