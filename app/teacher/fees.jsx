import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import PageHeader from "../../components/PageHeader";
import Colors from "../../styles/Colors";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Generate last 6 months including current
const getMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      d.toLocaleString("default", { month: "short", year: "numeric" })
    );
  }
  return months;
};

const FeeScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(getMonths()[0]);
  const [showDetails, setShowDetails] = useState(false);
  const months = getMonths();

  const toggleDetails = () => {
    LayoutAnimation.easeInEaseOut();
    setShowDetails(!showDetails);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <PageHeader text="Fees" />

      {/* Month Toggles */}
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

      {/* Fee Box */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fee</Text>

        <View style={styles.row}>
          <Text style={styles.amount}>Rs. 3000</Text>
          <Text style={styles.status}>PENDING</Text>
        </View>

        <Text style={styles.dueText}>
          to be paid before{" "}
          <Text style={{ fontWeight: "bold" }}>10-SEP-25</Text>
        </Text>

        {/* Expanded Fee Breakdown */}
        {showDetails && (
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text>Academic Fees</Text>
              <Text>Rs. 2000</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text>LMS Fees</Text>
              <Text>Rs. 500</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text>Exam Fees</Text>
              <Text>Rs. 300</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text>Misc Fees</Text>
              <Text>Rs. 200</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={{ fontWeight: "bold" }} >Total</Text>
              <Text style={{ fontWeight: "bold" }}>Rs. 3000</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.detailsBtn} onPress={toggleDetails}>
            <Text style={styles.detailsText}>
              {showDetails ? "Hide Details" : "Details"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.payBtn}>
            <Text style={styles.payText}>Download challan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FeeScreen;

const styles = StyleSheet.create({
  monthBar: {
    height: 44,
    justifyContent: "center",
  },
  monthScroll: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  monthBtn: {
    height: 36,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 6,
  },
  monthBtnActive: {
    backgroundColor: Colors.primary,
  },
  monthText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  monthTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  status: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
  dueText: {
    fontSize: 14,
    marginBottom: 16,
  },
  breakdown: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  detailsText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  payBtn: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
