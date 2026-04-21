import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";

import { getStudentMeetings } from "../../redux/actions/meetingAction";

import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";

const LinksScreen = () => {
  const dispatch = useDispatch();

  const Meeting = useSelector((state) => state.Meeting);
  const { studentMeeting, loading } = Meeting;

  const selectedMeeting = studentMeeting || {};
  const items = selectedMeeting.allItems || [];

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      getStudentMeetings({
        page: 1,
        limit: 5,
      })
    );
  }, []);

  // ===============================
  // Actions
  // ===============================
  const handleCopy = async (url) => {
    await Clipboard.setStringAsync(url);
    Alert.alert("Success", "Link copied to clipboard!");
  };

  const handleShare = async (url, title) => {
    try {
      await Share.share({
        message: `Here is the link for ${title}\n${url}`,
        url,
      });
    } catch (error) {
      Alert.alert("Error", "Could not share link.");
    }
  };

  const handleOpen = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Invalid URL");
      }
    } catch (error) {
      Alert.alert("Error", "Could not open URL.");
    }
  };

  // ===============================
  // Pagination
  // ===============================
  const loadMore = () => {
    if (loading || !selectedMeeting.hasMore) return;

    const nextPage = selectedMeeting.currentPage + 1;

    setPage(nextPage);

    dispatch(
      getStudentMeetings({
        page: nextPage,
        limit: 5,
      })
    );
  };

  // ===============================
  // Render Item
  // ===============================
  const renderItem = ({ item }) => (
    <View style={styles.linkCard}>
      <View style={styles.linkInfo}>
        <Ionicons
          name="link"
          size={24}
          color={Colors.primary}
          style={styles.icon}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.linkTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.linkSubTitle} numberOfLines={1}>
            {item.subject?.name}
          </Text>

          <Text style={styles.linkName} numberOfLines={1}>
            {item.teacher?.name}
          </Text>

          <Text style={styles.linkUrl} numberOfLines={1}>
            {item.link}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleCopy(item.link)}
        >
          <Ionicons name="copy-outline" size={20} color={Colors.secondary} />
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleShare(item.link, item.title)}
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color={Colors.secondary}
          />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryActionBtn]}
          onPress={() => handleOpen(item.link)}
        >
          <Ionicons name="open-outline" size={20} color={Colors.tertiary} />
          <Text style={[styles.actionText, styles.primaryActionText]}>
            Open
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={[styles.container, { backgroundColor: Colors.tertiary }]}>
        <PageHeader text="Links" />

        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<ListEmpty text="No Links Available" />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  container: {
    ...ContainerStyles.container,
    flex: 1,
  },

  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  linkCard: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
  },

  linkInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  icon: {
    marginRight: 12,
  },

  linkTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primaryDark,
    marginBottom: 4,
  },

  linkSubTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.secondary,
    marginBottom: 4,
  },

  linkName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 4,
  },

  linkUrl: {
    fontSize: 14,
    color: Colors.secondary,
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.quaternary + "20",
    paddingTop: 12,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.quaternary + "10",
  },

  primaryActionBtn: {
    backgroundColor: Colors.primary,
  },

  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondaryDark,
  },

  primaryActionText: {
    color: Colors.tertiary,
  },
});

export default LinksScreen;