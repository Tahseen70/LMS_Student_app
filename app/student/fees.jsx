import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
/* 🔔 NEW: Notifications & intent */
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { formatNumber, generateChallan } from "../../config";
import { getBank } from "../../redux/actions/schoolAction";
import { getStudentFee } from "../../redux/actions/studentAction";
import { setStudent } from "../../redux/slices/studentSlice";
import Colors from "../../styles/Colors";

// Generate last 6 months including current
const getMonths = (count = 12, offset = 0) => {
  const months = [];
  const now = new Date();
  for (let i = offset; i < offset + count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
};

/* 🔔 Notification config (required once) */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const FeeScreen = () => {
  const dispatch = useDispatch();
  const [selectedMonth, setSelectedMonth] = useState(getMonths()[0]);
  const [showDetails, setShowDetails] = useState(false);
  const [months, setMonths] = useState(() => getMonths(12, 0)); // initial 12 months
  const [offset, setOffset] = useState(12);
  const Student = useSelector((state) => state.Student);
  const { fee, loading } = Student;

  const School = useSelector((state) => state.School);
  const { bank } = School;

  const {
    amount = 0,
    lateFee = 0,
    extraFeeAmount = 0,
    extraFeeName = "",
    previousBalance = 0,
    lmsFee = 0,
    dueDate = new Date(),
    isPaid = false,
    isExpired = false,
    isFineWavedOff = false,
  } = fee || {};

  /* 🔔 Listen for notification tap → open file (Android) */
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { fileUri, mimeType } =
          response.notification.request.content.data || {};

        if (Platform.OS === "android" && fileUri) {
          try {
            await IntentLauncher.startActivityAsync(
              "android.intent.action.VIEW",
              {
                data: fileUri,
                type: mimeType || "application/pdf",
                flags: 268435457, // FLAG_ACTIVITY_NEW_TASK | FLAG_GRANT_READ_URI_PERMISSION
              }
            );
          } catch (err) {
            console.error("Failed to open file:", err);
            Alert.alert("Error", "Unable to open downloaded file.");
          }
        }
      }
    );

    return () => sub.remove();
  }, []);

  /* 🔔 Create notification channel (Android) */
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }
  }, []);

  /* 🔔 Request notification permissions */
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable notifications from system settings."
        );
      }
    })();
  }, []);

  /* 🔔 Trigger notification */
  const triggerNotification = async (filename, fileUri, mimeType) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Download Complete ✅",
        body: `${filename} has been saved.`,
        data: { fileUri, mimeType },
        channelId: "default",
      },
      trigger: null, // immediate
    });
  };

  let netAmount = amount + extraFeeAmount + previousBalance + lmsFee;
  const isLateFee = new Date() > new Date(dueDate) && !isFineWavedOff;
  const hasExtraFee = Boolean(extraFeeAmount) && Boolean(extraFeeName);
  if (isLateFee) netAmount += lateFee;
  if (hasExtraFee) netAmount += extraFeeAmount;

  const toggleDetails = () => {
    LayoutAnimation.easeInEaseOut();
    setShowDetails(!showDetails);
  };

  const loadMoreMonths = () => {
    const moreMonths = getMonths(6, offset); // load 6 more
    setMonths((prev) => [...prev, ...moreMonths]);
    setOffset(offset + 6);
  };

  const onMonthChange = (month) => {
    const formatted = moment(month)
      .clone()
      .startOf("month")
      .format("YYYY-MM-D");
    dispatch(setStudent({ name: "fee", value: null }));
    dispatch(getStudentFee({ month: formatted }));
    setSelectedMonth(month); // keep Date object for UI
  };

  useEffect(() => {
    (async () => {
      dispatch(setStudent({ name: "fee", value: null }));
      const campusStr = await AsyncStorage.getItem("school");
      const campus = JSON.parse(campusStr);
      const campusId = campus._id;
      dispatch(getBank({ campus: campusId }));

      const now = new Date();
      const formatted = moment(now)
        .clone()
        .startOf("month")
        .format("YYYY-MM-D");
      dispatch(getStudentFee({ month: formatted }));
      setSelectedMonth(now); // keep Date object for UI
    })();
  }, [dispatch]);

  const DownloadChallan = async () => {
    dispatch(
      setStudent({
        name: "loaderText",
        value: "Please Wait...Downloading File",
      })
    );
    dispatch(setStudent({ name: "loading", value: true }));
    const result = await generateChallan(fee, bank);
    if (result) {
      triggerNotification(result.filename, result.uri, result.type);
    }
    dispatch(setStudent({ name: "loading", value: false }));
    dispatch(
      setStudent({
        name: "loaderText",
        value: "",
      })
    );
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
                onPress={() => {
                  onMonthChange(month);
                }}
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

      {/* Fee Box */}
      {!fee && loading ? (
        <SkeletonLoader
          style={{ height: 175, borderRadius: 12 }}
          containerStyle={{ marginHorizontal: 8 }}
        />
      ) : fee ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fee</Text>

          <View style={styles.row}>
            <Text style={styles.amount}>Rs. {formatNumber(netAmount)}</Text>
            <Text
              style={{
                ...styles.status,
                color: isExpired
                  ? Colors.red
                  : isPaid
                  ? Colors.green
                  : Colors.blue,
              }}
            >
              {isExpired ? "EXPIRED" : isPaid ? "PAID" : "PENDING"}
            </Text>
          </View>

          <Text style={styles.dueText}>
            to be paid before{" "}
            <Text style={{ fontWeight: "bold" }}>
              {moment(dueDate).format("MMM DD, YYYY")}
            </Text>
          </Text>

          {showDetails && (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text>Academic Fees</Text>
                <Text>Rs. {formatNumber(amount)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text>LMS Fees</Text>
                <Text>Rs. {formatNumber(lmsFee)}</Text>
              </View>
              {hasExtraFee && (
                <View style={styles.breakdownRow}>
                  <Text>{String(extraFeeName)}</Text>
                  <Text>Rs. {formatNumber(extraFeeAmount)}</Text>
                </View>
              )}

              {isLateFee && (
                <View style={styles.breakdownRow}>
                  <Text>Late Fees</Text>
                  <Text>Rs. {formatNumber(lateFee)}</Text>
                </View>
              )}
              <View style={styles.breakdownRow}>
                <Text style={{ fontWeight: "bold" }}>Total</Text>
                <Text style={{ fontWeight: "bold" }}>
                  Rs. {formatNumber(netAmount)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.detailsBtn} onPress={toggleDetails}>
              <Text style={styles.detailsText}>
                {showDetails ? "Hide Details" : "Details"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.payBtn} onPress={DownloadChallan}>
              <Text style={styles.payText}>Download challan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ListEmpty text="Fee Not Found" />
      )}
    </SafeAreaView>
  );
};

export default FeeScreen;

const styles = StyleSheet.create({
  monthBar: {
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
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
  shimmer: {
    width: "90%",
    height: 180,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    opacity: 0.3,
    marginTop: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
});
