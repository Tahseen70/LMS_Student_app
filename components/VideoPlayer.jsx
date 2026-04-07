import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Video } from "expo-av";

const VideoPlayer = ({ url, setLoaded, style }) => {
  const [loading, setLoading] = useState(true);

  if (!url) return null;

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <ActivityIndicator size="large" style={styles.loader} />
      )}

      <Video
        source={{ uri: url }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"

        // 🔥 important events
        onLoad={() => {
          setLoading(false);
          setLoaded && setLoaded(true);
        }}

        onPlaybackStatusUpdate={(status) => {
          if (status.isBuffering) {
            setLoading(true);
          } else {
            setLoading(false);
          }
        }}

        shouldPlay={false} // change to true if you want autoplay
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
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loader: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    zIndex: 1,
  },
});