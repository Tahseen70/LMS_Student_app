import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker"; // ✅ Added
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { AddTeacherNote, getNotes } from "../../redux/actions/noteAction";
import {
  resetAddNote,
  setAddNote,
  setNote,
} from "../../redux/slices/noteSlice";
import Colors from "../../styles/Colors";
import ContainerStyles from "../../styles/ContainerStyles";
import HeaderStyles from "../../styles/HeaderStyles";
import NoteStyles from "../../styles/NoteStyles";

const AddNote = () => {
  const dispatch = useDispatch();
  const params = useLocalSearchParams();
  const initialClass = params.className
    ? String(params.className)
    : "Unknown Class";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const Note = useSelector((state) => state.Note);
  const { addNote, viewNotes } = Note;
  const { name, note } = addNote;
  const { selectedSubject, selectedClass } = viewNotes;

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].name) {
        const note = result.assets[0];
        dispatch(
          setAddNote({
            name: "note",
            value: note,
          })
        );
      } else if (result.canceled) {
        Alert.alert("Cancelled", "File selection was cancelled");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to pick a file");
    }
  };

  const handleSubmit = async () => {
    const classId = selectedClass._id;
    const subject = selectedSubject._id;
    const noteResult = await dispatch(
      AddTeacherNote({ name, classId, subject, note })
    );
    if (AddTeacherNote.fulfilled.match(noteResult)) {
      dispatch(resetAddNote());
      dispatch(
        setNote({
          name: "allNotes",
          value: [],
        })
      );
      await dispatch(getNotes({ classId, subject, page: 1, limit: 10 }));
      router.replace("/teacher/notes");
    }
  };

  const onChangeName = (text) => {
    dispatch(
      setAddNote({
        name: "name",
        value: text,
      })
    );
  };
  return (
    <View style={styles.container}>
      <PageHeader text={`Add Note`} />

      <View style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Title"
          value={name}
          onChangeText={onChangeName}
        />

        <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
          <Ionicons name="document-outline" size={24} color={Colors.tertiary} />
          <Text style={styles.filePickerText}>
            {note ? note?.name : "Pick a File"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={styles.submitGradient}>
            <Text style={styles.submitText}>Upload</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddNote;

const styles = StyleSheet.create({
  ...ContainerStyles,
  ...HeaderStyles,
  ...NoteStyles,
});
