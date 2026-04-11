import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import { useRouter } from "expo-router";
import SkeletonLoader from "../../components/SkeletonLoader";

import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";
import ListStyles from "../../styles/ListStyles";

import { getLessons, getLessonUrl } from "../../redux/actions/lessonAction";
import VideoModal from "../../components/VideoModal";
import { setStudent } from "../../redux/slices/studentSlice";

const LessonsScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const dispatch = useDispatch();
  const Lesson = useSelector((state) => state.Lesson);
  const {
    loading,
    allLessons = [],
    lessonsPage = 1,
    lessonsHasMore = false,
  } = Lesson;

  const Course = useSelector((state) => state.Course);
  const { selectedCourse } = Course;

  const handleLoadMore = () => {
    if (loading || !lessonsHasMore || !selectedCourse?._id) return;
    dispatch(
      getLessons({
        subject: selectedCourse._id,
        page: lessonsPage + 1,
        limit: 10,
      }),
    );
  };

  const handlePlay = async (lesson) => {
    try {
      setStudent({ name: "loading", value: true });
      setStudent({
        name: "loaderText",
        value: "Please Wait, Fetching Video...",
      });

      const data = await dispatch(
        getLessonUrl({ lessonId: lesson._id }),
      ).unwrap();
      setSelectedVideo(data.url);
      setModalVisible(true);

      setStudent({ name: "loading", value: false });
      setStudent({ name: "loaderText", value: "" });
    } catch (err) {
      console.error("Error fetching class data:", err);
      setStudent({ name: "loading", value: false });
      setStudent({ name: "loaderText", value: "" });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemIcon}>
        <Ionicons name={"videocam"} size={28} color={Colors.primaryDark} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item?.title || "Unnamed"}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handlePlay(item)}
        style={{
          backgroundColor: Colors.primary,
          color: Colors.tertiary,
          padding: 8,
          borderRadius: 5,
        }}
      >
        <Ionicons name="play-circle" size={20} color={Colors.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PageHeader text="Lessons" onBack={() => router.navigate("/student/course")} />

      <FlatList
        data={Array.isArray(allLessons) ? allLessons : []}
        keyExtractor={(item) => item._id} // ✅ use only unique ID
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader number={7} />
          ) : (
            <ListEmpty text="Lessons Not Found" />
          )
        }
      />

      <VideoModal
        visible={modalVisible}
        videoUrl={selectedVideo}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default LessonsScreen;

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  ...ListStyles,
  listContainer: { padding: 16 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  itemIcon: { width: 40, alignItems: "center", marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondaryDark,
  },
});
