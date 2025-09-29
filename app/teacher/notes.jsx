import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { getGraderFolderUri, hexToRgba } from "../../config";
import { getNotes } from "../../redux/actions/noteAction";
import { getSubjects } from "../../redux/actions/subjectAction";
import { resetNotes, setNote } from "../../redux/slices/noteSlice";
import { setSubject } from "../../redux/slices/subjectSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

export default function NotesScreen() {
  const dispatch = useDispatch();
  const Note = useSelector((state) => state.Note);
  const { loading, allNotes = [], notesPage = 1, notesHasMore = false } = Note;

  const Subject = useSelector((state) => state.Subject);
  const { subjects, selectedSubject } = Subject;
  const subjectLoading = Subject.loading;

  const [modalVisible, setModalVisible] = useState(false); // ✅ success modal state

  const handleLoadMore = () => {
    if (loading || !notesHasMore || !selectedSubject?._id) return;
    dispatch(
      getNotes({
        subjectId: selectedSubject._id,
        page: notesPage + 1,
        limit: 10,
      })
    );
  };

  const handleDownload = async (item, subject) => {
    dispatch(setNote({ name: "loading", value: true }));
    try {
      if (!item || !item.noteUrl) {
        Alert.alert("Error", "File URL not found.");
        return;
      }

      // file name & extension
      let name = item.name || "file";
      let ext = "pdf";
      if (item.noteType) {
        if (item.noteType.includes("/")) {
          const mimeToExt = {
            "application/pdf": "pdf",
            "image/jpeg": "jpg",
            "image/png": "png",
            "text/plain": "txt",
          };
          ext = mimeToExt[item.noteType] || "bin";
        } else {
          ext = item.noteType;
        }
      }

      name = name
        .replace(/[/\\?%*:|"<>.]/g, "_")
        .trim()
        .replace(/\s+/g, "_");
      const filename = `${name}.${ext}`;
      const localUri = FileSystem.cacheDirectory + filename;

      // Get Subject Info
      const subjectName = subject.name;
      // download into cache
      const { uri } = await FileSystem.downloadAsync(item.noteUrl, localUri);

      if (Platform.OS === "android") {
        // get/create Grader folder URI
        const graderUri = await getGraderFolderUri(["Notes", subjectName]);

        // create file in Grader folder
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          graderUri,
          filename,
          item.noteType || "application/pdf"
        );

        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await FileSystem.writeAsStringAsync(newUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("Success ✅", "File saved to Grader folder");
      } else {
        // handle iOS case separately if needed
      }
    } catch (error) {
      console.error("Android save error:", error);
      Alert.alert("Error ❌", "Could not save to Downloads folder.");
    }
    dispatch(setNote({ name: "loading", value: false }));
  };

  useEffect(() => {
    (async () => {
      try {
        dispatch(resetNotes());
        // if you use createAsyncThunk in RTK:
        const data = await dispatch(getSubjects()).unwrap();
        // now 'data' is exactly what you returned in your thunk
        console.log("Subjects:", data);
        const subjects = data?.subjects || [];
        if (subjects.length > 0) {
          const firstSubject = subjects[0];
          dispatch(
            setSubject({ name: "selectedSubject", value: firstSubject })
          );
          const subjectId = firstSubject._id;
          dispatch(getNotes({ subjectId, page: 1, limit: 10 }));
        }
        // you can also set it in local state:
        // setSubjects(data);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    })();
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemIcon}>
        <Ionicons
          name={
            item?.noteType === "folder" ? "folder-outline" : "document-outline"
          }
          size={28}
          color={Colors.primaryDark}
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item?.name || "Unnamed"}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDownload(item, selectedSubject)}
        style={{
          backgroundColor: Colors.primary,
          color: Colors.tertiary,
          padding: 8,
          borderRadius: 5,
        }}
      >
        <Ionicons name="download-outline" size={20} color={Colors.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const onSubjectChange = (value) => {
    dispatch(resetNotes());
    dispatch(setSubject({ name: "selectedSubject", value }));
    const subjectId = value._id;
    dispatch(getNotes({ subjectId, page: 1, limit: 10 }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader text="Notes" />
      {subjectLoading ? (
        <View style={styles.monthBar}>
          {[...Array(5)].map((_, index) => (
            <ShimmerPlaceholder style={styles.loaderItem} key={index} />
          ))}
        </View>
      ) : (
        <View style={styles.monthBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScroll}
          >
            {subjects.map((subject, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.monthBtn,
                  selectedSubject?._id === subject?._id &&
                    styles.monthBtnActive,
                ]}
                onPress={() => {
                  onSubjectChange(subject);
                }}
              >
                <Text
                  style={[
                    styles.monthText,
                    selectedSubject?._id === subject?._id &&
                      styles.monthTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List */}
      <FlatList
        data={Array.isArray(allNotes) ? allNotes : []}
        keyExtractor={(item, index) => `${item?._id || "note"}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={allNotes.length > 0 ? handleLoadMore : null}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader number={7} />
          ) : (
            <ListEmpty text={"Notes Not Found"} />
          )
        }
      />

      {/* ✅ Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              File downloaded successfully 🎉
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: Colors.tertiary, fontWeight: "bold" }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  monthBar: {
    marginTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  loaderItem: {
    borderRadius: 20,
    marginLeft: 8,
    width: 70,
    height: 30,
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
  listContainer: { padding: 16 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.tertiary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  itemIcon: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.secondaryDark,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsModal: {
    width: 200,
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 4,
  },
  modalButton: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(Colors.tertiaryDark, 0.6),
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.secondaryDark,
  },
  editModal: {
    width: 280,
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: Colors.tertiaryDark,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: Colors.primaryDark,
    padding: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    color: Colors.tertiary,
    textAlign: "center",
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    padding: 20,
    width: "75%",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

// Check if file is a media type (image/video) or document
// const isMediaFile =
//   item.noteType &&
//   (item.noteType.startsWith("image/") ||
//     item.noteType.startsWith("video/"));

// if (isMediaFile) {
//   // Handle media files (images/videos) - save to gallery
//   const { status } = await MediaLibrary.requestPermissionsAsync();
//   if (status !== "granted") {
//     Alert.alert(
//       "Permission required",
//       "Storage permission is needed to save media files."
//     );
//     return;
//   }

//   const asset = await MediaLibrary.createAssetAsync(uri);
//   await MediaLibrary.createAlbumAsync("Download", asset, false);
//   Alert.alert("Success ✅", "Media file saved to your gallery.");
// } else {
//   // Handle documents (PDF, txt, etc.) - use Sharing API
//   // if (await Sharing.isAvailableAsync()) {
//   //   await Sharing.shareAsync(uri, {
//   //     mimeType: item.noteType || "application/pdf",
//   //     dialogTitle: `Save ${filename}`,
//   //     UTI: "public.data",
//   //   });
//   // } else {
//   // Fallback: Save to app's document directory
//   // const documentUri = FileSystem.documentDirectory + filename;
//   // await FileSystem.copyAsync({ from: uri, to: documentUri });

// }
