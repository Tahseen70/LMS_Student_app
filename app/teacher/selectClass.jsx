import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { getClassAttendance } from "../../redux/actions/attendanceAction";
import { getClassStudents } from "../../redux/actions/studentAction";
import { getTeacherClass } from "../../redux/actions/teacherAction";
import { setAddAttendance } from "../../redux/slices/attendanceSlice";
import Colors from "../../styles/Colors";
import HeaderStyles from "../../styles/HeaderStyles";
import ListStyles from "../../styles/ListStyles";

const SelectClassScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const Teacher = useSelector((state) => state.Teacher);
  const { classes, loading } = Teacher;
  const handleSelect = async (item) => {
    const todaysDate = new Date();
    const formattedDate = moment(todaysDate).format("YYYY-MM-DD");
    const classId = item._id;

    dispatch(setAddAttendance({ name: "selectedclass", value: item }));
    dispatch(setAddAttendance({ name: "selectedDate", value: todaysDate }));

    try {
      // dispatch and capture resultActions
      const [attendanceResult, studentsResult] = await Promise.all([
        dispatch(getClassAttendance({ classId, date: formattedDate })),
        dispatch(getClassStudents({ classId })),
      ]);

      // check both results
      if (
        getClassAttendance.fulfilled.match(attendanceResult) &&
        getClassStudents.fulfilled.match(studentsResult)
      ) {
        router.push(
          `/teacher/attendance?className=${encodeURIComponent(item.name)}`
        );
      } else {
        console.error("One of the requests failed:", {
          attendanceResult,
          studentsResult,
        });
      }
    } catch (err) {
      console.error("Error fetching class data:", err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        <Ionicons name="school-outline" size={28} color={Colors.tertiary} />
        <Text style={styles.cardText}>
          Grade {item.name}-{item.section} ({item.timeDuration.name})
        </Text>
        <Ionicons name="chevron-forward" size={24} color={Colors.tertiary} />
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    dispatch(getTeacherClass());
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/bg.png")} // ✅ your background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <PageHeader text="Select Class for Attendance" />

        <FlatList
          data={classes}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoader number={7} />
            ) : (
              <ListEmpty text={"Class Not Found"} />
            )
          }
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ...HeaderStyles,
  ...ListStyles,
});

export default SelectClassScreen;
