import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const addClassAttendance = createAsyncThunk(
  "teacher/addClassAttendance",
  async ({ attendances }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("attendances", JSON.stringify(attendances));
      const resp = await Axios.post(
        "/attendance/addMultipleAttendance",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getClassAttendance = createAsyncThunk(
  "teacher/getClassAttendance",
  async ({ classId, date }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      formData.append("date", String(date));
      const resp = await Axios.post("/attendance/getAttendances", formData, {
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

export const updateClassAttendance = createAsyncThunk(
  "teacher/updateClassAttendance",
  async ({ attendances }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("attendances", JSON.stringify(attendances));
      const resp = await Axios.post(
        "/attendance/updateMultipleAttendances",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
