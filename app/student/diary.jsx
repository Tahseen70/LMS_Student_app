import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { getStudentDiary } from "../../redux/actions/studentAction";
import { setStudent } from "../../redux/slices/studentSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";
import ListEmpty from "../../components/ListEmpty";
import SkeletonLoader from "../../components/SkeletonLoader";

const DiaryScreen = () => {
  const dispatch = useDispatch();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const {
    diaryDate,
    diaries = [],
    loading,
  } = useSelector((state) => state.Student);

  const onDateChange = async (date) => {
    setDatePickerVisible(false);

    const formattedDate = moment(date).format("YYYY-MM-DD");

    await dispatch(getStudentDiary({ date: formattedDate }));

    dispatch(
      setStudent({
        name: "diaryDate",
        value: date,
      })
    );
  };

  useEffect(() => {
    const today = moment().toDate();
    dispatch(setStudent({ name: "diaryDate", value: today }));
    dispatch(getStudentDiary({ date: moment(today).format("YYYY-MM-DD") }));
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader text="Diary" />

      {/* DATE */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Selected Date</Text>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setDatePickerVisible(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={Colors.secondaryDark}
          />
          <Text style={styles.dateText}>
            {moment(diaryDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={diaryDate}
        maximumDate={new Date()}
        onConfirm={onDateChange}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* LOADING */}
      {loading && (
        <SkeletonLoader
          style={{ height: 175, borderRadius: 12 }}
          containerStyle={{ marginHorizontal: 16 }}
        />
      )}

      {/* DIARY LIST */}
      {!loading && diaries.length > 0 && (
        <ScrollView contentContainerStyle={styles.diaryContainer}>
          {diaries.map((diary, index) => (
            <View key={index} style={styles.diaryCard}>
              <Text style={styles.subject}>{diary.subject?.name}</Text>
              <Text style={styles.teacher}>{diary.teacher?.name}</Text>
              <Text style={styles.message}>{diary.message}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* EMPTY STATE */}
      {!loading && diaries.length === 0 && (
        <ListEmpty text={"No Diary Entries Found"} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,

  dateContainer: {
    marginTop: 10,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.secondaryDark,
  },

  diaryContainer: {
    padding: 16,
  },
  diaryCard: {
    backgroundColor: Colors.tertiary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  subject: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: Colors.primary,
  },
  teacher: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },

  loading: {
    marginTop: 40,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondaryDark,
  },
});

export default DiaryScreen;
