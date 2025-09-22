import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PageHeader from "../../components/PageHeader";
import Colors from "../../styles/Colors";

// Generate last 6 months including current
const getMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      d.toLocaleString("default", { month: "short", year: "numeric" })
    );
  }
  return months;
};

// Function to generate dummy data for weekdays only
const generateDummyAttendance = (monthYear) => {
  const start = moment(monthYear, "MMM YYYY").startOf("month");
  const end = moment(monthYear, "MMM YYYY").endOf("month");

  const statuses = ["present", "absent", "leave"];
  const data = [];

  for (let d = start.clone(); d.isSameOrBefore(end); d.add(1, "day")) {
    const day = d.day(); // 0=Sun, 6=Sat
    if (day === 0 || day === 6) continue; // skip weekends

    // Random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    data.push({ date: d.format("YYYY-MM-DD"), status });
  }

  return data;
};

const StudentAttendanceScreen = () => {
  const months = getMonths();
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  // Generate dummy attendance each time month changes
  const attendanceData = useMemo(() => {
    return generateDummyAttendance(selectedMonth);
  }, [selectedMonth]);

  // Count stats
  const presentCount = attendanceData.filter((a) => a.status === "present").length;
  const absentCount = attendanceData.filter((a) => a.status === "absent").length;
  const leaveCount = attendanceData.filter((a) => a.status === "leave").length;

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.dateCell}>
        {moment(item.date).format("DD MMM YYYY")}
      </Text>
      <Text
        style={[
          styles.statusCell,
          item.status === "present" && { color: Colors.present },
          item.status === "absent" && { color: Colors.absent },
          item.status === "leave" && { color: Colors.leave },
        ]}
      >
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </Text>
    </View>
  );

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
        >
          {months.map((month, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.monthBtn,
                selectedMonth === month && styles.monthBtnActive,
              ]}
              onPress={() => setSelectedMonth(month)}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === month && styles.monthTextActive,
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { backgroundColor: Colors.present }]}>
          <Text style={styles.summaryLabel}>Present</Text>
          <Text style={styles.summaryCount}>{presentCount}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: Colors.absent }]}>
          <Text style={styles.summaryLabel}>Absent</Text>
          <Text style={styles.summaryCount}>{absentCount}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: Colors.leave }]}>
          <Text style={styles.summaryLabel}>Leave</Text>
          <Text style={styles.summaryCount}>{leaveCount}</Text>
        </View>
      </View>

      {/* Attendance Table */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
      </View>
      <FlatList
        data={attendanceData}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  monthBar: {
    marginTop: 8,
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
