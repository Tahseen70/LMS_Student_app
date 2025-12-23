import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const loginStudent = createAsyncThunk(
  "student/login",
  async (payload, thunkAPI) => {
    try {
      const { email, password } = payload;
      let resp = await Axios.post("/student/login", { email, password });
      const student = resp.data.user;
      const token = resp.data.token;
      await AsyncStorage.setItem("student", JSON.stringify(student));
      await AsyncStorage.setItem("token", token);
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ------------------ LOGIN WITH TOKEN ------------------
export const loginToken = createAsyncThunk(
  "teacher/token",
  async (_, thunkAPI) => {
    try {
      let resp = await Axios.get("/student/token");
      const student = resp.data.user;
      // const token = resp.data.token;
      await AsyncStorage.setItem("student", JSON.stringify(student));
      // await AsyncStorage.setItem("token", token);
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getClassStudents = createAsyncThunk(
  "student/getClassStudents",
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

// ------------------ TIMETABLE ------------------
export const getStudentTimeTable = createAsyncThunk(
  "student/getStudentTimeTable",
  async (_, thunkAPI) => {
    try {
      let resp = await Axios.get("/student/timeTable");
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getStudentFee = createAsyncThunk(
  "student/getStudentFee",
  async ({ month }, thunkAPI) => {
    try {
      let params = { month };
      let resp = await Axios.get("/fee/student/month", { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getStudentDiary = createAsyncThunk(
  "student/getStudentDiary",
  async ({ date }, thunkAPI) => {
    try {
      const params = {
        date,
      };

      const resp = await Axios.get("/diary/student", { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
