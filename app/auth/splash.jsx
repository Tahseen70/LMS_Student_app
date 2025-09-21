import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
import { hexToRgba } from "../../config";
import {
  getAllcampuses,
  getAllschools, // ✅ FIX: added import
} from "../../redux/actions/schoolAction";
import { setSchool } from "../../redux/slices/schoolSlice";
import Colors from "../../styles/Colors";

const { height: screenHeight } = Dimensions.get("screen");

export default function OnboardingScreen() {
  const heightAnim = useRef(new Animated.Value(screenHeight)).current;
  const radiusAnim = useRef(new Animated.Value(0)).current;
  const [isFocusSchool, setIsFocusSchool] = useState(false);
  const [isFocusCampus, setIsFocusCampus] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const School = useSelector((state) => state.School);
  const {
    schools = [],
    campuses = [],
    selectedSchool,
    selectedCampus,
    loading,
  } = School;

  // Format schools for dropdown
  const schoolOptions = schools.map((s) => ({
    label: s.name,
    value: s._id,
    school: s,
  }));

  // Format campuses for dropdown
  const campusOptions = campuses.map((c) => ({
    label: c.name,
    value: c._id,
    campus: c,
    serverUrl: c.serverUrl,
  }));

  useEffect(() => {
    (async () => {
      await dispatch(getAllschools());
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: screenHeight * 0.35,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(radiusAnim, {
          toValue: 30, // final radius
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    })();
  }, []);

  const onSchoolChange = async (school) => {
    dispatch(setSchool({ name: "selectedSchool", value: school }));

    await dispatch(getAllcampuses({ school: school._id }));
  };

  const onCampusChange = async (campus) => {
    dispatch(setSchool({ name: "selectedCampus", value: campus }));
  };

  const handleContinue = async () => {
    if (selectedCampus) {
      try {
        await AsyncStorage.setItem("school", JSON.stringify(selectedCampus));
        router.push("/auth/login");
      } catch (err) {
        console.error("Error saving school:", err);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const schoolSelected = await AsyncStorage.getItem("school");
      if (schoolSelected) router.push("/auth/login");
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            height: heightAnim,
            borderBottomLeftRadius: radiusAnim,
            borderBottomRightRadius: radiusAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo_round_white.png")}
            style={styles.logo}
          />
        </View>
      </Animated.View>

      {/* White Card Section */}
      <View style={styles.card}>
        {/* School Dropdown */}
        <Dropdown
          style={[
            styles.dropdown,
            isFocusSchool && { borderColor: Colors.primary, borderWidth: 1 },
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={{ color: Colors.primary, fontSize: 16 }}
          inputSearchStyle={styles.inputSearchStyle}
          data={loading ? [] : schoolOptions}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Choose your school"
          searchPlaceholder="Search..."
          value={selectedSchool?._id}
          onFocus={() => setIsFocusSchool(true)}
          onBlur={() => setIsFocusSchool(false)}
          onChange={(item) => {
            onSchoolChange(item.school);
            setIsFocusSchool(false);
          }}
          renderItem={(item) => (
            <View style={{ padding: 12 }}>
              <Text style={{ color: Colors.quaternary }}>{item.label}</Text>
            </View>
          )}
        />

        {/* Campus Dropdown */}
        <Dropdown
          style={[
            styles.dropdown,
            isFocusCampus && { borderColor: Colors.primary, borderWidth: 1 },
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={{ color: Colors.primary, fontSize: 16 }}
          inputSearchStyle={{ color: Colors.quaternary }}
          data={loading ? [] : campusOptions}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Choose campus"
          searchPlaceholder="Search..."
          value={selectedCampus?._id}
          onFocus={() => setIsFocusCampus(true)}
          onBlur={() => setIsFocusCampus(false)}
          onChange={(item) => {
            onCampusChange(item.campus);
            setIsFocusCampus(false);
          }}
          disable={!selectedSchool}
          renderItem={(item) => (
            <View style={{ padding: 12 }}>
              <Text style={{ color: Colors.quaternary }}>{item.label}</Text>
            </View>
          )}
        />

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, { opacity: selectedCampus ? 1 : 0.6 }]}
          onPress={handleContinue}
          disabled={!selectedCampus}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tertiary,
  },
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    overflow: "hidden",
    backgroundColor: Colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1,
    marginTop: screenHeight * 0.4,
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: Colors.tertiary,
  },
  dropdown: {
    backgroundColor: "rgba(90,63,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 60,
    marginBottom: 25,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
    width: "60%",
  },
  buttonText: {
    color: Colors.tertiary,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  logo: {
    width: 180,
    resizeMode: "contain",
  },
  placeholderStyle: {
    color: hexToRgba(Colors.secondary, 0.7),
  },
  inputSearchStyle: {
    color: Colors.quaternary,
  },
});
