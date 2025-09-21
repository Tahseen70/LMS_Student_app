import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import { getTeacherTimeTable } from "../../redux/actions/teacherAction";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

// Global Vars
const cellHeight = 110;
const cellWidth = 100;

const TeacherScheduleScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const Teacher = useSelector((state) => state.Teacher);
  const { loading, timeTable } = Teacher;
  const timetableData = timeTable;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const findPeriodData = (periods, periodNumber) => {
    return periods.find((p) => p.period === periodNumber) || null;
  };

  // Format data
  const formatData = (data) => {
    let days = ["monday", "tuesday", "wednesday", "thursday"];
    if (data.timeDuration.isFridayOn) days.push("friday");

    if (data.timeDuration.isSaturdayOn) days.push("saturday");

    const result = {};
    const numberOfClasses = data.timeDuration.numberOfClasses || 0;
    const timetable = data.timetable;
    if (timetable) {
      days.forEach((day) => {
        result[capitalize(day)] = [];

        const periods = timetable[day] || [];
        for (let i = 0; i < numberOfClasses; i++) {
          const periodData = findPeriodData(periods, i);
          if (!periodData) {
            // Free period
            result[capitalize(day)][i] = {
              className: "Free",
              subject: "",
            };
          } else {
            // Scheduled period
            result[capitalize(day)][i] = {
              className: `${periodData.class.name}${
                periodData.class.section ? " " + periodData.class.section : ""
              }`,
              subject: periodData.subject.name,
            };
          }
        }
      });
    }

    return result;
  };

  useEffect(() => {
    dispatch(getTeacherTimeTable());
  }, [dispatch]);

  const hasTimetable =
    !!timetableData &&
    !!timetableData.timetable &&
    // timetable should be a non-empty object (at least one day)
    Object.keys(timetableData.timetable).length > 0 &&
    // timeDuration must exist and numberOfClasses must be a positive integer
    !!timetableData.timeDuration &&
    Number.isInteger(timetableData.timeDuration.numberOfClasses) &&
    timetableData.timeDuration.numberOfClasses > 0;

  if (!hasTimetable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={28}
                  color={Colors.tertiary}
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Weekly Schedule</Text>
              <View style={{ width: 28 }} />
            </View>
          </View>
          <ListEmpty text={"Timetable Not Found"} />
        </View>
      </SafeAreaView>
    );
  }

  const schedule = formatData(timetableData);
  const numClasses = timetableData.timeDuration.numberOfClasses || 0;
  const days = Object.keys(schedule);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.container}>
        {/* Header */}
        <PageHeader text="Weekly Schedule" />

        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.row}>
                <View style={styles.timeCell}>
                  <Text style={styles.headerText}>Day</Text>
                </View>
                {Array.from({ length: numClasses }).map((_, i) => (
                  <React.Fragment key={i}>
                    <View style={styles.headerCell}>
                      <Text style={styles.headerText}>Period {i + 1}</Text>
                    </View>
                    {/* Break column header after 4th period */}
                    {i + 1 === 4 && (
                      <View style={styles.breakCell}>
                        <Text style={styles.breakText}>BREAK</Text>
                      </View>
                    )}
                  </React.Fragment>
                ))}
              </View>

              {/* Day Rows */}
              {days.map((day) => (
                <View key={day} style={styles.row}>
                  <View style={styles.timeCell}>
                    <Text style={styles.dayText}>{day}</Text>
                  </View>
                  {schedule[day].map((period, i) => (
                    <React.Fragment key={i}>
                      <View style={styles.cell}>
                        <View style={{ alignItems: "center" }}>
                          <Text style={styles.cellText}>
                            {period.className}
                          </Text>
                          {period.subject ? (
                            <Text style={styles.subjectText}>
                              {period.subject}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {/* Break column after 4th period */}
                      {i + 1 === 4 && (
                        <View style={styles.breakCell}>
                          <Text style={styles.breakText}>BREAK</Text>
                        </View>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  ...ContainerStyles,
  ...HeaderStyles,
  table: {
    margin: 10,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
  },
  row: { flexDirection: "row" },
  headerCell: {
    width: cellWidth,
    height: cellHeight,
    padding: 5,
    backgroundColor: Colors.primaryDark,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  timeCell: {
    width: cellWidth,
    height: cellHeight,
    padding: 5,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: cellWidth,
    height: cellHeight,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: Colors.tertiary,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  dayText: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: Colors.tertiary,
  },
  cellText: { fontSize: 13, textAlign: "center", fontWeight: "bold" },
  subjectText: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.secondary,
    marginTop: 2,
  },
  breakCell: {
    width: 80, // make it wide enough
    height: cellHeight,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  breakText: {
    color: Colors.tertiary,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});

export default TeacherScheduleScreen;
