// VideoModal.js
import React, { useState, useEffect } from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { usePreventScreenCapture } from "expo-screen-capture";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../styles/Colors";

const VideoModal = ({ visible, videoUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  // Prevent screenshots and screen recording while this modal is mounted
  usePreventScreenCapture();

  // Initialize the native expo-video player
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.play(); // Auto-play when modal opens
  });

  // Listen to player status
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setLoading(false);
      } else if (status === 'loading') {
        setLoading(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  // Adjust dimensions gracefully
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const { width, height } = dimensions;

  // React Native Modal needs supportedOrientations to not restrict rotation if triggered
  return (
    <Modal 
      animationType="slide" 
      transparent={true} 
      visible={visible}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Please wait while the video is loading</Text>
          </View>
        )}

        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
            contentFit="contain"
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
            }}
          />
        </View>

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
  videoContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
  },
  loaderContainer: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default VideoModal;