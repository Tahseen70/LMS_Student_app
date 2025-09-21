import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const getClassStudents = createAsyncThunk(
  "teacher/getClassStudents",
  async ({ classId }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      const resp = await Axios.post("/student/byClass", formData, {
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
