import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { getSubjects } from "../../redux/actions/subjectAction";
import { setSubject } from "../../redux/slices/subjectSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";
import ListStyles from "../../styles/ListStyles";
import { getCourses } from "../../redux/actions/courseAction";
import { resetCourses, setCourse } from "../../redux/slices/courseSlice";
import { getLessons } from "../../redux/actions/lessonAction";
import { useRouter } from "expo-router";

const CoursesScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const Course = useSelector((state) => state.Course);
  const {
    loading,
    allCourses = [],
    coursesPage = 1,
    coursesHasMore = false,
  } = Course;

  const Subject = useSelector((state) => state.Subject);
  const { subjects, selectedSubject } = Subject;
  const subjectLoading = Subject.loading;

  const [modalVisible, setModalVisible] = useState(false); // ✅ success modal state

  const handleLoadMore = () => {
    if (loading || !coursesHasMore || !selectedSubject?._id) return;
    dispatch(
      getCourses({
        subject: selectedSubject._id,
        page: coursesPage + 1,
        limit: 10,
      }),
    );
  };

  useEffect(() => {
    (async () => {
      try {
        dispatch(resetCourses());
        // if you use createAsyncThunk in RTK:
        const data = await dispatch(getSubjects()).unwrap();
        const subjects = data?.subjects || [];
        if (subjects.length > 0) {
          const firstSubject = subjects[0];
          dispatch(
            setSubject({ name: "selectedSubject", value: firstSubject }),
          );
          const subject = firstSubject._id;
          dispatch(getCourses({ subject, page: 1, limit: 10 }));
        }
        // you can also set it in local state:
        // setSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    })();
  }, [dispatch]);

  const handleSelect = async (item) => {
    console.log(item);
    dispatch(setCourse({ name: "selectedCourse", value: item }));
    try {
      const course = item._id;
      const lessonResult = await dispatch(
        getLessons({ course, page: 1, limit: 10 }),
      );
      if (getLessons.fulfilled.match(lessonResult)) {
        router.push(`/student/lesson`);
      }
    } catch (err) {
      console.error("Error fetching class data:", err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => handleSelect(item)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        <Ionicons name="school-outline" size={28} color={Colors.tertiary} />
        <Text style={styles.cardText}>{item.title}</Text>
        <Ionicons
          name="arrow-forward-outline"
          size={24}
          color={Colors.tertiary}
        />
      </View>
    </TouchableOpacity>
  );

  const onSubjectChange = (value) => {
    dispatch(resetCourses());
    dispatch(setSubject({ name: "selectedSubject", value }));
    const subject = value._id;
    dispatch(getCourses({ subject, page: 1, limit: 10 }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader text="Select Course" onBack={() => router.navigate("/student/more")} />
      {subjectLoading ? (
        <View style={styles.monthBar}>
          {[...Array(5)].map((_, index) => (
            <ShimmerPlaceholder style={styles.loaderItem} key={index} />
          ))}
        </View>
      ) : (
        <View style={styles.monthBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScroll}
          >
            {subjects.map((subject, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.monthBtn,
                  selectedSubject?._id === subject?._id &&
                    styles.monthBtnActive,
                ]}
                onPress={() => {
                  onSubjectChange(subject);
                }}
              >
                <Text
                  style={[
                    styles.monthText,
                    selectedSubject?._id === subject?._id &&
                      styles.monthTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List */}
      <FlatList
        data={Array.isArray(allCourses) ? allCourses : []}
        keyExtractor={(item, index) => `${item?._id || "course"}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={allCourses.length > 0 ? handleLoadMore : null}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader number={7} />
          ) : (
            <ListEmpty text={"Courses Not Found"} />
          )
        }
      />

      {/* ✅ Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              File downloaded successfully 🎉
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: Colors.tertiary, fontWeight: "bold" }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CoursesScreen;

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  ...ListStyles,
  monthBar: {
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loaderItem: {
    borderRadius: 20,
    marginLeft: 8,
    width: 70,
    height: 30,
  },
  monthScroll: {
    paddingHorizontal: 10,
  },
  monthBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    marginRight: 8,
  },
  monthBtnActive: {
    backgroundColor: Colors.primary,
  },
  monthText: {
    fontSize: 14,
    color: "#333",
  },
  monthTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
