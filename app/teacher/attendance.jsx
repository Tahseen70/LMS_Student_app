import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import moment from "moment";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import {
  addClassAttendance,
  getClassAttendance,
  updateClassAttendance,
} from "../../redux/actions/attendanceAction";
import {
  setAddAttendance,
  setAddAttendanceStatus,
} from "../../redux/slices/attendanceSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const AttendanceScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const Attendance = useSelector((state) => state.Attendance);
  const { addAttendance, loading } = Attendance;
  const { selectedDate, isVisible, selectedclass, attendances, alreadyMarked } =
    addAttendance;

  const Student = useSelector((state) => state.Student);
  const { students } = Student;

  const handleAttendance = (student, status) => {
    const prev = attendances?.[student] || {};
    const attendanceObj = {
      ...prev,
      class: selectedclass?._id,
      student: String(student),
      status,
      date: moment(selectedDate).format("YYYY-MM-DD"),
    };
    dispatch(
      setAddAttendanceStatus({ name: String(student), value: attendanceObj })
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = Object.values(attendances || {});
      if (!payload.length) {
        Alert.alert("Error", "No attendance to submit!");
        return;
      }

      if (alreadyMarked) {
        await dispatch(
          updateClassAttendance({ attendances: payload })
        ).unwrap();
        Alert.alert("Success", "Attendance updated successfully!", [
          { text: "OK", onPress: () => router.replace("/teacher/home") },
        ]);
      } else {
        await dispatch(addClassAttendance({ attendances: payload })).unwrap();
        Alert.alert("Success", "Attendance added successfully!", [
          { text: "OK", onPress: () => router.replace("/teacher/home") },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong while saving attendance");
    }
  };

  const renderItem = ({ item, index }) => {
    const studentAttendance = attendances?.[item._id] ?? {};
    const status = studentAttendance?.status ?? null;

    return (
      <View style={styles.studentRow}>
        <Text style={styles.serial}>{index + 1}.</Text>
        <Text style={styles.studentName}>{item.name}</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  status === "present" ? Colors.present : Colors.pending,
              },
            ]}
            onPress={() => handleAttendance(item._id, "present")}
          >
            <Text style={styles.buttonText}>Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  status === "absent" ? Colors.absent : Colors.pending,
              },
            ]}
            onPress={() => handleAttendance(item._id, "absent")}
          >
            <Text style={styles.buttonText}>Absent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              {
                backgroundColor:
                  status === "leave" ? Colors.leave : Colors.pending,
              },
            ]}
            onPress={() => handleAttendance(item._id, "leave")}
          >
            <Text style={styles.buttonText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onDateChange = (date) => {
    dispatch(setAddAttendance({ name: "selectedDate", value: date }));
    dispatch(
      getClassAttendance({
        classId: selectedclass?._id,
        date: moment(date).format("YYYY-MM-DD"),
      })
    );
  };

  const setDatePickerVisibility = (value) => [
    dispatch(setAddAttendance({ name: "isVisible", value })),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader
        text={`Attendance of class ${selectedclass?.name}-${selectedclass?.section}`}
      />
      {alreadyMarked && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Attendance already marked!</Text>
        </View>
      )}

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Selected Date:</Text>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setDatePickerVisibility(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={Colors.secondaryDark}
          />
          <Text style={styles.dateText}>
            {moment(selectedDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        date={selectedDate}
        onConfirm={onDateChange}
        onHide={() => setDatePickerVisibility(false)}
        onCancel={() => setDatePickerVisibility(false)}
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <View style={styles.submitGradient}>
              <Text style={styles.submitText}>
                {alreadyMarked ? "Update" : "Add"} Attendance
              </Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  banner: {
    backgroundColor: Colors.banner,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  bannerText: {
    color: Colors.secondaryDark,
    fontWeight: "bold",
  },
  dateContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.secondaryDark,
  },
  listContainer: {
    padding: 16,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: Colors.tertiary,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  serial: {
    width: 30,
    fontSize: 16,
    fontWeight: "bold",
  },
  studentName: {
    flex: 1,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: "row",
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 6,
  },
  buttonText: {
    color: Colors.tertiary,
    fontWeight: "bold",
    fontSize: 12,
  },
  submitButton: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.primary,
  },
  submitGradient: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: {
    color: Colors.tertiary,
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AttendanceScreen;
