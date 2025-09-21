import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ListEmpty from "../../components/ListEmpty";
import PageHeader from "../../components/PageHeader";
import SkeletonLoader from "../../components/SkeletonLoader";
import { hexToRgba } from "../../config";
import { DeleteTeacherNote, getNotes } from "../../redux/actions/noteAction";
import { setNote, setViewNotes } from "../../redux/slices/noteSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";

export default function NotesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const Note = useSelector((state) => state.Note);
  const {
    viewNotes,
    loading,
    allNotes = [],
    notesPage = 1,
    notesHasMore = false,
  } = Note;
  const { selectedClass, selectedSubject, selectedNote } = viewNotes;
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // ✅ success modal state

  const handleLoadMore = () => {
    if (!loading && notesHasMore) {
      const classId = selectedClass._id;
      const subject = selectedSubject._id;
      dispatch(getNotes({ page: notesPage + 1, limit: 10, classId, subject }));
    }
  };

  const handleOptions = (note) => {
    dispatch(
      setViewNotes({
        name: "selectedNote",
        value: note,
      })
    );
    setIsOptionsVisible(true);
  };

  const handleDownload = async () => {
    setIsOptionsVisible(false);
    if (!selectedNote || !selectedNote.noteUrl) {
      return;
    }

    try {
      const fileUri = selectedNote.noteUrl;
      let name = selectedNote.name || "file";

      // Handle MIME type → extension
      let ext = "pdf";

      if (selectedNote.noteType) {
        if (selectedNote.noteType.includes("/")) {
          const mimeToExt = {
            "application/pdf": "pdf",
            "image/jpeg": "jpg",
            "image/png": "png",
            "text/plain": "txt",
          };
          ext = mimeToExt[selectedNote.noteType] || "bin";
        } else {
          ext = selectedNote.noteType;
        }
      }

      // sanitize name
      name = name.replace(/[/\\?%*:|"<>.]/g, "_").trim();
      name = name.replace(/\s+/g, "_");

      // temp path inside cache
      const localUri = FileSystem.cacheDirectory + `${name}.${ext}`;

      // download into cache
      const { uri } = await FileSystem.downloadAsync(fileUri, localUri);

      // ask permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Storage permission is needed to save files."
        );
        return;
      }

      // save to system downloads/photos
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Success ✅", "File saved to your Downloads folder!");
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error ❌", "Could not download file.");
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    const noteId = selectedNote._id;
    const noteResult = await dispatch(DeleteTeacherNote({ noteId }));
    if (DeleteTeacherNote.fulfilled.match(noteResult)) {
      dispatch(
        setNote({
          name: "allNotes",
          value: [],
        })
      );
      const classId = selectedClass._id;
      const subject = selectedSubject._id;
      await dispatch(getNotes({ classId, subject, page: 1, limit: 10 }));
    }
    setIsOptionsVisible(false);
    dispatch(
      setViewNotes({
        name: "selectedNote",
        value: null,
      })
    );
  };

  const handleEdit = () => {
    if (!selectedNote) return;
    const noteId = selectedNote._id;
    const name = selectedNote.name;
    const fileName = `${selectedNote.name} (${selectedNote.noteType})`;

    dispatch(
      setNote({
        name: "updateNote",
        value: { noteId, name, note: null, fileName },
      })
    );
    router.push("/teacher/updateNote");
    setIsOptionsVisible(false);
    setIsEditVisible(true);
  };

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
        onPress={() => handleOptions(item)}
        style={{
          backgroundColor: Colors.primary,
          color: Colors.tertiary,
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.tertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFooter = () =>
    loading ? <ActivityIndicator style={{ margin: 10 }} /> : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader text="Notes" />
      {/* List */}

      <FlatList
        data={Array.isArray(allNotes) ? [] : []}
        keyExtractor={(item, index) => `${item._id || "note"}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          true ? (
            <SkeletonLoader number={7} />
          ) : (
            <ListEmpty text={"Notes Not Found"} />
          )
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/teacher/addNote")}
      >
        <Ionicons name="add" size={28} color={Colors.tertiary} />
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        transparent
        visible={isOptionsVisible}
        animationType="fade"
        onRequestClose={() => setIsOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsOptionsVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.optionsModal}>
            <TouchableOpacity onPress={handleEdit} style={styles.modalButton}>
              <Text style={styles.modalText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
              <Text style={[styles.modalText, { color: "red" }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDownload}
              style={{ ...styles.modalButton, borderBottomWidth: 0 }}
            >
              <Text style={[styles.modalText, { color: "red" }]}>Download</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
