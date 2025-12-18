import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import {
  getAttendanceByMonth,
  getAttendanceStatsByMonth,
} from "../../redux/actions/attendanceAction";
import Colors from "../../styles/Colors";

// Function to generate N months backwards from now
const getMonths = (count = 12, offset = 0) => {
  const months = [];
  const now = new Date();
  for (let i = offset; i < offset + count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
};

const StudentAttendanceScreen = () => {
  const [months, setMonths] = useState(() => getMonths(12, 0)); // initial 12 months
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [offset, setOffset] = useState(12); // how many months already loaded
  const dispatch = useDispatch();
  const Attendance = useSelector((state) => state.Attendance);
  const { attendances, stats, loading } = Attendance;
  const { present, absent, leave } = stats;

  const renderItem = ({ item }) => {
    return (
      <View style={styles.tableRow}>
        <Text style={styles.dateCell}>
          {moment(item.date).format("DD MMM YYYY")}
        </Text>
        <Text
          style={[
            styles.statusCell,
            item.status === "present" && { color: Colors.green },
            item.status === "absent" && { color: Colors.red },
            item.status === "leave" && { color: Colors.blue },
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    );
  };

  // Load more months when scrolled to end
  const loadMoreMonths = () => {
    const moreMonths = getMonths(6, offset); // load 6 more
    setMonths((prev) => [...prev, ...moreMonths]);
    setOffset(offset + 6);
  };

  const onMonthChange = (month) => {
    const m = moment(month);
    const date = m.clone().startOf("month").format("YYYY-MM-D");
    dispatch(getAttendanceByMonth({ date }));
    dispatch(getAttendanceStatsByMonth({ date }));
    setSelectedMonth(month); // also keep Date object here
  };

  useEffect(() => {
    const now = new Date();
    const m = moment(now);
    const date = m.clone().startOf("month").format("YYYY-MM-D");
    dispatch(getAttendanceByMonth({ date }));
    dispatch(getAttendanceStatsByMonth({ date }));
    setSelectedMonth(now); // keep Date object!
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <PageHeader text="Attendance" />
      {/* Month Toggle */}
      <View style={styles.monthBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthScroll}
          onMomentumScrollEnd={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              e.nativeEvent;
            const isEndReached =
              contentOffset.x + layoutMeasurement.width >=
              contentSize.width - 50; // near end
            if (isEndReached) {
              loadMoreMonths();
            }
          }}
        >
          {months.map((month, idx) => {
            const isActive =
              selectedMonth.getFullYear() === month.getFullYear() &&
              selectedMonth.getMonth() === month.getMonth();
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.monthBtn, isActive && styles.monthBtnActive]}
                onPress={() => onMonthChange(month)}
              >
                <Text
                  style={[styles.monthText, isActive && styles.monthTextActive]}
                >
                  {month.toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { backgroundColor: Colors.green }]}>
          <Text style={styles.summaryLabel}>Present</Text>
          <Text style={styles.summaryCount}>{present.toString()}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: Colors.red }]}>
          <Text style={styles.summaryLabel}>Absent</Text>
          <Text style={styles.summaryCount}>{absent.toString()}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: Colors.blue }]}>
          <Text style={styles.summaryLabel}>Leave</Text>
          <Text style={styles.summaryCount}>{leave.toString()}</Text>
        </View>
      </View>

      {/* Attendance Table */}
      <View>
        <FlatList
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
            </View>
          }
          data={attendances}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            !loading && attendances.length === 0 ? (
              <ListEmpty text="No Attendances Found." />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  monthBar: {
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryCount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 16,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dateCell: {
    flex: 1,
    fontSize: 14,
  },
  statusCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

export default StudentAttendanceScreen;
