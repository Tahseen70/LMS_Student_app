import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import PageHeader from "../../components/PageHeader";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const StudentResultScreen = () => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [showSelect, setShowSelect] = useState(true);

  // Sample Data
  const exams = [
    { id: "1", name: "Mid Term" },
    { id: "2", name: "Final Term" },
  ];

  const results = {
    "Mid Term": [
      { id: "1", subject: "Math", total: 100, obtained: 85 },
      { id: "2", subject: "English", total: 100, obtained: 74 },
      { id: "3", subject: "Science", total: 100, obtained: 91 },
    ],
    "Final Term": [
      { id: "1", subject: "Math", total: 100, obtained: 79 },
      { id: "2", subject: "English", total: 100, obtained: 88 },
      { id: "3", subject: "Science", total: 100, obtained: 83 },
    ],
  };

  const data = selectedExam ? results[selectedExam.name] : [];

  const totalMarks = data.reduce((sum, item) => sum + item.total, 0);
  const obtainedMarks = data.reduce((sum, item) => sum + item.obtained, 0);
  const percentage =
    totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <PageHeader text="My Results" />

      {/* Exam Selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Exam:</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedExam(value)}
          value={selectedExam}
          items={exams.map((exam) => ({
            label: exam.name,
            value: exam,
          }))}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
          placeholder={{ label: "Choose Exam...", value: null }}
        />
      </View>

      {/* Result Summary Card */}
      {selectedExam && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{selectedExam.name} Result</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total Marks:</Text>
            <Text style={styles.summaryValue}>{totalMarks}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Obtained Marks:</Text>
            <Text style={styles.summaryValue}>{obtainedMarks}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Percentage:</Text>
            <Text style={styles.summaryValue}>{percentage}%</Text>
          </View>
        </View>
      )}

      {/* Subject-wise Table */}
      {selectedExam && (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.headerCell]}>Subject</Text>
            <Text style={[styles.cell, styles.headerCell]}>Total</Text>
            <Text style={[styles.cell, styles.headerCell]}>Obtained</Text>
            <Text style={[styles.cell, styles.headerCell]}>%</Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const subjectPercent = ((item.obtained / item.total) * 100).toFixed(
                2
              );
              return (
                <View style={styles.tableRow}>
                  <Text style={styles.cell}>{item.subject}</Text>
                  <Text style={styles.cell}>{item.total}</Text>
                  <Text style={styles.cell}>{item.obtained}</Text>
                  <Text style={styles.cell}>{subjectPercent}%</Text>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,

  pickerContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
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

  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.tertiaryLight,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 16,
    color: Colors.secondaryDark,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.quaternary,
  },

  tableContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.tertiaryDark,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Colors.tertiaryDark,
    paddingVertical: 10,
    backgroundColor: Colors.tertiary,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: Colors.quaternary,
  },
  headerCell: {
    fontWeight: "bold",
    color: Colors.tertiary,
  },
});

export default StudentResultScreen;
