import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import {
  getClassStudents,
  getStudentFee,
  getStudentTimeTable,
  loginStudent,
  loginToken,
} from "../actions/studentAction";

const initialState = {
  loading: false,
  loaderText: "",
  students: [],
  email: "",
  password: "",
  student: null,
  timeTable: {},
  fee: {},
  timeDuration: {},
  classes: [],
  updatePassword: {
    isForgot: false,
    email: "",
    otp: ["", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  },
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudent(state, action) {
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
      // Login Student
      .addCase(loginStudent.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload.user;
      })
      .addCase(loginStudent.rejected, (state) => {
        state.loading = false;
      })
      // STUDENTS
      .addCase(getClassStudents.pending, (state) => {
        state.loading = true;
        state.students = [];
      })
      .addCase(getClassStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.students || [];
      })
      .addCase(getClassStudents.rejected, (state) => {
        state.loading = false;
      })
      // STUDENTS
      .addCase(getStudentTimeTable.pending, (state) => {
        state.loading = true;
        state.students = [];
      })
      .addCase(getStudentTimeTable.fulfilled, (state, action) => {
        const data = action.payload.timetable;
        const schedule = data.schedule;
        const timeDuration = data.timeDuration;
        state.timeTable = schedule;
        state.timeDuration = timeDuration;
        state.loading = false;
      })
      .addCase(getStudentTimeTable.rejected, (state) => {
        state.loading = false;
      })
      // Login Teacher With Token
      .addCase(loginToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginToken.fulfilled, (state, action) => {
        state.loading = false;
        state.student = action.payload.user;
      })
      .addCase(loginToken.rejected, (state) => {
        state.loading = false;
      })
      // Get Fee by Month
      .addCase(getStudentFee.pending, (state) => {
        state.loading = true;
        state.students = [];
      })
      .addCase(getStudentFee.fulfilled, (state, action) => {
        const data = action.payload.fees;
        state.fee = data;
        state.loading = false;
      })
      .addCase(getStudentFee.rejected, (state) => {
        state.loading = false;
      })

      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setStudent, setUpdatePassword, resetUpdatePassword } =
  studentSlice.actions;

export default studentSlice.reducer;
