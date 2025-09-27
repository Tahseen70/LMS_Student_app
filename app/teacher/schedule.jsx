import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { getStudentTimeTable } from "../../redux/actions/studentAction";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

// Global Vars
const cellHeight = 110;
const cellWidth = 100;

const TeacherScheduleScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const Student = useSelector((state) => state.Student);
  const { loading, timeTable, timeDuration } = Student;

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const findPeriodData = (periods, periodNumber) => {
    return periods.find((p) => p.period === periodNumber) || null;
  };

  // Format data
  const formatData = (data) => {
    console.log("DATA=");
    console.log(data);
    let days = ["monday", "tuesday", "wednesday", "thursday"];
    if (timeDuration?.isFridayOn) days.push("friday");

    if (timeDuration?.isSaturdayOn) days.push("saturday");

    const result = {};
    const numberOfClasses = timeDuration?.numberOfClasses || 0;
    const timetable = data;
    if (timetable) {
      days.forEach((day) => {
        result[capitalize(day)] = [];

        const periods = timetable[day] || [];
        for (let i = 0; i < numberOfClasses; i++) {
          const periodData = findPeriodData(periods, i);
          console.log("periodData=");
          console.log(periodData);
          if (periodData?.isFree) {
            // Free period
            result[capitalize(day)][i] = {
              teacher: "Free",
              subject: "",
            };
          } else {
            // Scheduled period
            result[capitalize(day)][i] = {
              teacher: `${periodData.teacher.name}`,
              subject: periodData.subject.name,
            };
          }
        }
      });
    }

    return result;
  };

  useEffect(() => {
    dispatch(getStudentTimeTable());
  }, [dispatch]);

  const hasTimetable =
    !!timeTable &&
    !!timeTable &&
    // timetable should be a non-empty object (at least one day)
    Object.keys(timeTable).length > 0 &&
    // timeDuration must exist and numberOfClasses must be a positive integer
    !!timeDuration &&
    Number.isInteger(timeDuration?.numberOfClasses) &&
    timeDuration?.numberOfClasses > 0;

  const schedule = formatData(timeTable);
  console.log("schedule=");
  console.log(schedule);
  console.log(timeDuration);
  const numClasses = timeDuration?.numberOfClasses || 0;
  const days = Object.keys(schedule);
  console.log(days);

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
                          <Text style={styles.cellText}>{period.teacher}</Text>
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
});

export default TeacherScheduleScreen;
