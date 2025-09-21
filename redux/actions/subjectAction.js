import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

// Fetch subjects for a selected class
export const getSubjects = createAsyncThunk(
  "subject/getSubjects",
  async ({ classId }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      const resp = await Axios.post("/subject/teacher", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    } catch (error) {
      console.log("errors in fetching subjects:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
