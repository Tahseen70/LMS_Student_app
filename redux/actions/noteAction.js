import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const AddTeacherNote = createAsyncThunk(
  "note/addNote",
  async ({ name, classId, subject, note }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("name", String(name));
      formData.append("classId", String(classId));
      formData.append("subject", String(subject));

      if (note) {
        formData.append("note", {
          uri: note.uri,
          type: note.mimeType || "application/octet-stream",
          name: note.name || `file-${Date.now()}`,
        });
      }

      const resp = await Axios.post("/note/addNote", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const DeleteTeacherNote = createAsyncThunk(
  "note/deleteNote",
  async ({ noteId }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("noteId", String(noteId));

      const resp = await Axios.post("/note/delete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return resp.data;
    } catch (error) {
      console.log("Error adding note:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const UpdateTeacherNote = createAsyncThunk(
  "note/updateNote",
  async ({ name, classId, subject, note, noteId }, thunkAPI) => {
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("classId", classId);
      formData.append("subject", subject);
      formData.append("noteId", noteId);

      if (note) {
        formData.append("note", {
          uri: note.uri,
          type: note.mimeType || note.type || "application/pdf", // ✅ always send a valid type
          name:
            note.name && /\.[a-zA-Z0-9]+$/.test(note.name)
              ? note.name
              : `file-${Date.now()}.pdf`, // ✅ ensure file has extension
        });
      }

      const resp = await Axios.post("/note/updateNote", formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      return resp.data;
    } catch (error) {
      console.log(
        "❌ Error updating note:",
        error.response?.data || error.message
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Fetch Notes of Teacher by Class and Subject
export const getNotes = createAsyncThunk(
  "note/getNotes",
  async ({ subjectId, page = 1, limit = 10 }, thunkAPI) => {
    try {
      let params = {
        subjectId,
        page,
        limit,
      };
      const resp = await Axios.get("/note/student", { params });
      console.log(resp.data);
      return resp.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
