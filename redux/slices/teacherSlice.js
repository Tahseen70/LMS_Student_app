import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import {
  getTeacherClass,
  getTeacherTimeTable,
  loginTeacher,
  sendOtp
} from "../actions/teacherAction";

const initialState = {
  userId: "",
  password: "",
  loading: false,
  teacher: null,
  timeTable: {},
  classes: [],
  updatePassword: {
    isForgot: false,
    email: "",
    otp: ["", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  },
};

const teacherSlice = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setTeacher(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    setUpdatePassword(state, action) {
      state.updatePassword[action.payload.name] = action.payload.value;
    },
    resetUpdatePassword(state, action) {
      state.updatePassword = initialState.updatePassword;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Teacher
      .addCase(loginTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teacher = action.payload.user;
      })
      .addCase(loginTeacher.rejected, (state) => {
        state.loading = false;
      })
      // Get Timetable for Teacher
      .addCase(getTeacherTimeTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherTimeTable.fulfilled, (state, action) => {
        state.loading = false;
        state.timeTable = action.payload.timetable;
      })
      .addCase(getTeacherTimeTable.rejected, (state) => {
        state.loading = false;
      })

      // Get Classes of Teacher 
      .addCase(getTeacherClass.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeacherClass.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload.classes;
      })
      .addCase(getTeacherClass.rejected, (state) => {
        state.loading = false;
      })

      // Send OTP to email
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state) => {
        state.loading = false;
      })

      // reset to Initial State
      .addCase(resetState, () => initialState);
  },
});

export const {
  setTeacher,
  setAddAttendance,
  setAddAttendanceStatus,
  setViewNotes,
  setAddNote,
  resetAddNote,
  setUpdateNote,
  setMarks,
  setMarksValue,
  setUpdatePassword,
  resetUpdatePassword,
} = teacherSlice.actions;

export default teacherSlice.reducer;
