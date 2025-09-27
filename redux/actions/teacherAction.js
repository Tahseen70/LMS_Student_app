import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

// ------------------ LOGIN ------------------
export const loginTeacher = createAsyncThunk(
  "teacher/login",
  async (payload, thunkAPI) => {
    try {
      const { email, password } = payload;
      let resp = await Axios.post("/teacher/login", { email, password });
      const teacher = resp.data.user;
      const token = resp.data.token;
      await AsyncStorage.setItem("teacher", JSON.stringify(teacher));
      await AsyncStorage.setItem("token", token);
      return resp.data;
    } catch (error) {
      console.log("Login Error:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);



// ------------------ TIMETABLE ------------------
export const getTeacherTimeTable = createAsyncThunk(
  "teacher/getTimeTable",
  async (_, thunkAPI) => {
    try {
      let resp = await Axios.get("/teacher/timeTable");
      return resp.data;
    } catch (error) {
      console.log("Error fetching timetable:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ------------------ CLASSES ------------------
export const getTeacherClass = createAsyncThunk(
  "teacher/getClasses",
  async (_, thunkAPI) => {
    try {
      let resp = await Axios.get("/teacher/classes");
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const sendOtp = createAsyncThunk(
  "teacher/sendOtp",
  async ({ email }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("email", String(email));

      const resp = await Axios.post("/teacher/sendOTP", formData, {
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

export const checkOtp = createAsyncThunk(
  "teacher/sendOtp",
  async ({ email, otp }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("otp", String(otp));
      formData.append("email", String(email));

      const resp = await Axios.post("/teacher/checkOTP", formData, {
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

export const changePassword = createAsyncThunk(
  "teacher/sendOtp",
  async ({ email, otp, password }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("otp", String(otp));
      formData.append("email", String(email));
      formData.append("password", String(password));

      const resp = await Axios.post("/teacher/changePassword", formData, {
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
