import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { usePreventScreenCapture } from "expo-screen-capture";

const VideoPlayer = ({ url, setLoaded, style }) => {
  const [loading, setLoading] = useState(true);

  // Prevent screenshots and screen recording while this component is mounted
  usePreventScreenCapture();

  // Initialize the new, better expo-video player
  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
  });

  // Listen for player status changes to handle loading state
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setLoading(false);
        if (setLoaded) setLoaded(true);
      } else if (status === 'loading') {
        setLoading(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, setLoaded]);

  if (!url) return null;

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Please wait while the video is loading</Text>
        </View>
      )}

      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        fullscreenOptions={{
          enable: true,
          orientation: 'landscape',
        }}
      />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
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