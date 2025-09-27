// styles.js
import { StyleSheet } from "react-native";
import Colors from "./Colors";

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    elevation: 3,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    backgroundColor: Colors.tertiary,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  filePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  filePickerText: {
    color: Colors.tertiary,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.primary,
  },
  submitGradient: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: {
    color: Colors.tertiary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
