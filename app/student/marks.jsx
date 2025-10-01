import { Fragment, useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import {
  getAllExams,
  getAllGrades,
  getStudentExams,
} from "../../redux/actions/markAction";
import { setMarks } from "../../redux/slices/marksSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

const StudentResultScreen = () => {
  const dispatch = useDispatch();
  const Marks = useSelector((state) => state.Marks);
  const { allExams, results, selectedExam, grades } = Marks;
  const { studentResults, showGrades, showRemarks } = results;
  const data = studentResults || [];
  const hasData = Boolean(data.length > 0);

  const totalMarks = data.reduce((sum, item) => sum + item.totalMarks, 0);
  const obtainedMarks = data.reduce((sum, item) => sum + item.obtainedMarks, 0);
  const percentage =
    totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(2) : 0;

  useEffect(() => {
    dispatch(getAllExams());
    dispatch(getAllGrades());
  }, []);

  useEffect(() => {
    dispatch(getAllGrades());
  }, [dispatch, showGrades]);

  const onChange = async (name, value) => {
    dispatch(setMarks({ name, value }));
    const examId = value._id;
    await dispatch(getStudentExams({ examId }));
  };
  const columnStyles = {
    subject: { minWidth: 120, flexShrink: 0, flexGrow: 0 }, // subject names can be long
    total: { minWidth: 60, flexShrink: 0, flexGrow: 0 },
    obtained: { minWidth: 80, flexShrink: 0, flexGrow: 0 },
    percent: { minWidth: 60, flexShrink: 0, flexGrow: 0 },
    grade: { minWidth: 80, flexShrink: 0, flexGrow: 0 },
    remarks: { minWidth: 200, flexShrink: 0, flexGrow: 0 }, // long text needs space
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <PageHeader text="My Results" />

      {/* Exam Selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Exam:</Text>
        <RNPickerSelect
          onValueChange={(value) => {
            onChange("selectedExam", value);
          }}
          value={selectedExam}
          items={allExams.map((exam) => ({
            label: exam.name,
            value: exam,
            key: exam._id,
          }))}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
          placeholder={{ label: "Choose Exam...", value: null }}
        />
      </View>
      {hasData ? (
        <Fragment>
          {/* Result Summary Card */}
          {selectedExam && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {selectedExam.name} Result
              </Text>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  <ScrollView horizontal>
                    <FlatList
                      data={data}
                      keyExtractor={(item, idx) => idx.toString()}
                      ListHeaderComponent={
                        <View style={styles.tableHeader}>
                          <Text
                            style={[
                              styles.cell,
                              styles.headerCell,
                              columnStyles.subject,
                            ]}
                          >
                            Subject
                          </Text>
                          <Text
                            style={[
                              styles.cell,
                              styles.headerCell,
                              columnStyles.total,
                            ]}
                          >
                            Total
                          </Text>
                          <Text
                            style={[
                              styles.cell,
                              styles.headerCell,
                              columnStyles.obtained,
                            ]}
                          >
                            Obtained
                          </Text>
                          <Text
                            style={[
                              styles.cell,
                              styles.headerCell,
                              columnStyles.percent,
                            ]}
                          >
                            %
                          </Text>
                          {showGrades && (
                            <Text
                              style={[
                                styles.cell,
                                styles.headerCell,
                                columnStyles.grade,
                              ]}
                            >
                              Grade
                            </Text>
                          )}
                          {showRemarks && (
                            <Text
                              style={[
                                styles.cell,
                                styles.headerCell,
                                columnStyles.remarks,
                              ]}
                            >
                              Remarks
                            </Text>
                          )}
                        </View>
                      }
                      renderItem={({ item }) => {
                        const subjectPercent = (
                          (item.obtainedMarks / item.totalMarks) *
                          100
                        ).toFixed(2);

                        const matchedGrade = grades.find(
                          (grade) =>
                            subjectPercent >= grade.min &&
                            subjectPercent <= grade.max
                        );

                        return (
                          <View style={styles.tableRow}>
                            <Text style={[styles.cell, columnStyles.subject]}>
                              {item.subject}
                            </Text>
                            <Text style={[styles.cell, columnStyles.total]}>
                              {item.totalMarks}
                            </Text>
                            <Text style={[styles.cell, columnStyles.obtained]}>
                              {item.obtainedMarks}
                            </Text>
                            <Text style={[styles.cell, columnStyles.percent]}>
                              {subjectPercent}%
                            </Text>
                            {showGrades && (
                              <Text style={[styles.cell, columnStyles.grade]}>
                                {matchedGrade ? matchedGrade.name : "-"}
                              </Text>
                            )}
                            {showRemarks && (
                              <Text
                                style={[styles.cell, columnStyles.remarks]}
                                numberOfLines={1}
                                ellipsizeMode="clip" // prevent wrapping
                              >
                                {matchedGrade ? matchedGrade.remarks : "-"}
                              </Text>
                            )}
                          </View>
                        );
                      }}
                    />
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          )}
        </Fragment>
      ) : (
        <ListEmpty text={"No Exam Data Found"} />
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
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
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
    flex: 2,
    textAlign: "center",
    flexDirection: "row",
    fontSize: 14,
    color: Colors.quaternary,
    flexShrink: 0,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  headerCell: {
    fontWeight: "bold",
    color: Colors.tertiary,
  },
});

export default StudentResultScreen;
