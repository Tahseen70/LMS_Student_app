import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PageHeader from "../../components/PageHeader";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";

const LinksScreen = () => {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  // Placeholder links for now
  const [links, setLinks] = useState([
    {
      id: "1",
      title: "School Official Website",
      url: "https://www.example.com",
      description: "Visit our official website for more updates and news.",
    },
    {
      id: "2",
      title: "Student Portal Guide",
      url: "https://www.example.com/guide",
      description: "A comprehensive guide on how to use the student portal effectively.",
    },
  ]);

  const copyToClipboard = async (url) => {
    await Clipboard.setStringAsync(url);
    Alert.alert("Copied", "Link copied to clipboard!");
  };

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open this URL.");
    }
  };

  const shareLink = async (title, url) => {
    try {
      await Share.share({
        message: `${title}\n${url}`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        <PageHeader
          text="Links"
          onBack={() =>
            router.navigate(from === "home" ? "/student/home" : "/student/more")
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {links.length > 0 ? (
            links.map((link) => (
              <View key={link.id} style={styles.linkCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="link" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.linkTitle} numberOfLines={1}>
                      {link.title}
                    </Text>
                    {link.description && (
                      <Text style={styles.linkDescription} numberOfLines={2}>
                        {link.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.linkDisplay}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {link.url}
                  </Text>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openLink(link.url)}
                  >
                    <Ionicons name="open-outline" size={18} color={Colors.tertiary} />
                    <Text style={styles.actionText}>Open</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.copyBtn]}
                    onPress={() => copyToClipboard(link.url)}
                  >
                    <Ionicons name="copy-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.actionText, styles.copyText]}>Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.shareBtn]}
                    onPress={() => shareLink(link.title, link.url)}
                  >
                    <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.actionText, styles.shareText]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="link-outline" size={64} color={Colors.primaryDark} />
              <Text style={styles.emptyText}>No links available at the moment.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  ...ContainerStyles,
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  linkCard: {
    backgroundColor: Colors.tertiary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.quaternary,
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 13,
    color: Colors.quaternary + "90", // slightly faded
  },
  linkDisplay: {
    backgroundColor: Colors.tertiaryDark + "40", // light background
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  urlText: {
    fontSize: 14,
    color: Colors.primaryDark,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: Colors.tertiary,
    fontSize: 14,
    fontWeight: "600",
  },
  copyBtn: {
    backgroundColor: Colors.tertiary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  copyText: {
    color: Colors.primary,
  },
  shareBtn: {
    backgroundColor: Colors.tertiary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  shareText: {
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.quaternary,
    marginTop: 16,
    fontWeight: "500",
  },
});

export default LinksScreen;
