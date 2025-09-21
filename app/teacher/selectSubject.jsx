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
import { getNotes } from "../../redux/actions/noteAction";
import { getTeacherClass } from "../../redux/actions/teacherAction";
import { setNote, setViewNotes } from "../../redux/slices/noteSlice";
import Colors from "../../styles/Colors";
import HeaderStyles from "../../styles/HeaderStyles";
import ListStyles from "../../styles/ListStyles";

const SelectedSubject = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const Subject = useSelector((state) => state.Subject);
  const { subjects, loading } = Subject;

  const Note = useSelector((state) => state.Note);
  const { viewNotes } = Note;
  const { selectedClass } = viewNotes;

  const handleSelect = async (item) => {
    dispatch(setViewNotes({ name: "selectedSubject", value: item }));
    try {
      const classId = selectedClass._id;
      const subject = item._id;
      dispatch(
        setNote({
          name: "allNotes",
          value: [],
        })
      );
      const noteResult = await dispatch(
        getNotes({ classId, subject, page: 1, limit: 10 })
      );
      if (getNotes.fulfilled.match(noteResult)) {
        router.push(`/teacher/selectSubject`);
      }
    } catch (err) {
      console.log("Selected Subject Err:", err);
    }
    router.push(`/teacher/notes`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => handleSelect(item)}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        <Ionicons name="school-outline" size={28} color={Colors.tertiary} />
        <Text style={styles.cardText}>{item.name}</Text>
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
      source={require("../../assets/bg.png")} // ✅ your background image
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <PageHeader text="Select Subject" />

        <FlatList
          data={subjects}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            loading ? (
              <SkeletonLoader number={7} />
            ) : (
              <ListEmpty text={"Subjects Not Found"} />
            )
          }
        />
      </View>
    </ImageBackground>
  );
};

export default SelectedSubject;

const styles = StyleSheet.create({
  ...HeaderStyles,
  ...ListStyles,
  container: {
    flex: 1,
  },
});
