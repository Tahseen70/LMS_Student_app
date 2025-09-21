import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { getTeacherClass } from "../../redux/actions/teacherAction";
import { setMarks } from "../../redux/slices/marksSlice";
import Colors from "../../styles/Colors";
import HeaderStyles from "../../styles/HeaderStyles";
import ListStyles from "../../styles/ListStyles";

const SelectClassMarksScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const Teacher = useSelector((state) => state.Teacher);
  const { classes, loading } = Teacher;

  const Marks = useSelector((state) => state.Marks);
  const { marksInfo } = Marks;

  const handleSelect = (item) => {
    dispatch(
      setMarks({
        name: "marksInfo",
        value: {
          ...marksInfo,
          selectedClass: item,
        },
      })
    );
    router.push(`/teacher/marks`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => handleSelect(item)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        <Ionicons name="school-outline" size={28} color={Colors.tertiary} />
        <Text
          style={styles.cardText}
        >{`Grade ${item.name}-${item.section}`}</Text>
        <Ionicons
          name="arrow-forward-outline"
          size={24}
          color={Colors.tertiary}
        />
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    dispatch(getTeacherClass());
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <PageHeader text="Select Class for Marks" />

        <FlatList
          data={classes}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoader number={7} />
            ) : (
              <ListEmpty text={"Class Not Found"} />
            )
          }
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  ...HeaderStyles,
  ...ListStyles,
  container: {
    flex: 1,
  },
});

export default SelectClassMarksScreen;
