import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import {
  addExam,
  getAllExams,
  getTeacherExamResult,
  updateExam,
} from "../../redux/actions/markAction";
import { getClassStudents } from "../../redux/actions/studentAction";
import { getSubjects } from "../../redux/actions/subjectAction";
import { setMarksInfo, setMarksValue } from "../../redux/slices/marksSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const MarksScreen = () => {
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [showSelect, setShowSelect] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);

  // animated values (start open)
  const animatedHeight = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(1)).current;

  const Marks = useSelector((state) => state.Marks);
  const { marksInfo, allExams } = Marks;
  const {
    resultId,
    selectedClass,
    selectedExam,
    selectedSubject,
    marks,
    totalMarks,
    alreadyGraded,
  } = marksInfo;
  const className = selectedClass
    ? `${selectedClass.name}-${selectedClass.section}`
    : "Unknown Class";

  const Subject = useSelector((state) => state.Subject);
  const { subjects } = Subject;

  const Student = useSelector((state) => state.Student);
  const { students, loading } = Student;

  const handleMarksChange = (item, value) => {
    // only digits
    const cleanValue = value.replace(/\D/g, "");

    // allow empty (clear input)
    if (cleanValue === "") {
      dispatch(
        setMarksValue({
          name: item._id,
          value: { student: item._id, obtainedMarks: "" },
        })
      );
      return;
    }

    const entered = parseInt(cleanValue, 10);

    // block input if totalMarks not set
    if (!totalMarks || isNaN(totalMarks)) {
      Alert.alert("Error", "Please enter Total Marks first.");
      return;
    }

    // if entered marks exceed totalMarks, block input (do nothing)
    if (entered > totalMarks) {
      return;
    }

    // otherwise update
    dispatch(
      setMarksValue({
        name: item._id,
        value: { student: item._id, obtainedMarks: entered },
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const subject = selectedSubject._id;
      const exam = selectedExam._id;
      const classId = selectedClass._id;
      const studentResults = Object.values(marks);

      if (alreadyGraded) {
        await dispatch(
          updateExam({
            resultId,
            totalMarks,
            studentResults,
          })
        ).unwrap();

        Alert.alert("Success", "Marks updated successfully!", [
          { text: "OK", onPress: () => router.replace("/teacher/home") },
        ]);
      } else {
        await dispatch(
          addExam({
            subject,
            exam,
            classId,
            totalMarks,
            studentResults,
          })
        ).unwrap();

        Alert.alert("Success", "Marks added successfully!", [
          { text: "OK", onPress: () => router.replace("/teacher/home") },
        ]);
      }
    } catch (error) {
      console.error("Failed to submit exam:", error);
      Alert.alert("Error", "Something went wrong while submitting marks.");
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.studentRow}>
        <Text style={styles.serial}>{`${index + 1}.`}</Text>
        <Text style={styles.studentName}>{item.name}</Text>
        <TextInput
          placeholder="Enter Marks"
          style={styles.input}
          keyboardType="numeric"
          value={marks[item._id]?.obtainedMarks?.toString() || ""}
          onChangeText={(value) => handleMarksChange(item, value)}
        />
      </View>
    );
  };

  useEffect(() => {
    const classId = selectedClass?._id;
    dispatch(getSubjects({ classId }));
    dispatch(getAllExams());
    dispatch(getClassStudents({ classId }));
  }, []);

  const onChange = (name, value) => {
    dispatch(setMarksInfo({ name, value }));
  };

  const onSubjectChange = (value) => {
    onChange("selectedSubject", value);
    onChange("alreadyGraded", false);
    if (selectedClass && selectedExam && value) {
      const classId = selectedClass?._id;
      const subject = value?._id;
      const exam = selectedExam?._id;
      dispatch(getTeacherExamResult({ classId, subject, exam }));
    }
  };

  const onExamChange = (value) => {
    onChange("alreadyGraded", false);
    onChange("selectedExam", value);
    if (selectedClass && value && selectedSubject) {
      const classId = selectedClass?._id;
      const subject = selectedSubject?._id;
      const exam = value?._id;
      dispatch(getTeacherExamResult({ classId, subject, exam }));
    }
  };

  const toggleDropdown = () => {
    const toValue = showSelect ? 0 : 1;

    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    Animated.timing(rotateAnim, {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    setShowSelect(!showSelect);
  };

  // Interpolations
  const heightInterpolate = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight || 300],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0} // adjust if header overlaps
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <PageHeader text={`Marks of class ${className}`} />

        {Boolean(alreadyGraded) && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Marks already graded!</Text>
          </View>
        )}

        {/* Dropdown */}
        <View style={styles.selectContainer}>
          <View style={styles.toggleConainer}>
            <TouchableOpacity style={styles.toggleBtn} onPress={toggleDropdown}>
              <Animated.View
                style={{ transform: [{ rotate: rotateInterpolate }] }}
              >
                <Ionicons
                  name="chevron-down"
                  size={24}
                  color={Colors.tertiaryLight}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={{ overflow: "hidden", height: heightInterpolate }}
          >
            <View
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Exam:</Text>
                <RNPickerSelect
                  onValueChange={(value) => onExamChange(value)}
                  value={selectedExam}
                  items={allExams.map((exam) => ({
                    label: exam.name,
                    value: exam,
                  }))}
                  style={{
                    inputIOS: styles.picker,
                    inputAndroid: styles.picker,
                  }}
                />
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Subject:</Text>
                <RNPickerSelect
                  onValueChange={(value) => onSubjectChange(value)}
                  value={selectedSubject}
                  items={subjects.map((subject) => ({
                    label: subject.name,
                    value: subject,
                  }))}
                  style={{
                    inputIOS: styles.picker,
                    inputAndroid: styles.picker,
                  }}
                />
              </View>

              {Boolean(selectedClass) && Boolean(selectedSubject) && (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Total Marks:</Text>
                  <TextInput
                    placeholder="e.g. 100"
                    value={totalMarks?.toString() || ""}
                    onChangeText={(text) => onChange("totalMarks", text)}
                    keyboardType="numeric"
                    style={styles.picker}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Students list */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 10, fontSize: 16 }}>Loading...</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Fragment>
              {Boolean(selectedClass) && Boolean(selectedSubject) && (
                <FlatList
                  data={students}
                  keyExtractor={(item) => item._id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContainer}
                />
              )}
            </Fragment>
          </View>
        )}

        {/* Submit Button pinned at bottom */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={styles.submitGradient}>
            <Text style={styles.submitText}>
              {alreadyGraded ? "Update" : "Add"} Marks
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  pickerContainer: {
    marginTop: 0,
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
    color: Colors.secondaryDark,
  },
  picker: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    borderRadius: 8,
    backgroundColor: Colors.tertiary,
    color: Colors.quaternary,
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
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: "center",
    backgroundColor: Colors.tertiary,
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleConainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  toggleBtn: {
    backgroundColor: Colors.primary,
    color: "white",
    padding: 10,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectContainer: {
    backgroundColor: Colors.tertiaryLight,
    height: "auto",
  },
  flatListContainer: {
    minHeight: 150,
  },
});

export default MarksScreen;
