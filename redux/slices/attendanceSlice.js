import { createSlice } from "@reduxjs/toolkit";
import {
  addClassAttendance,
  getAttendanceByMonth,
  getAttendanceStatsByMonth,
  getClassAttendance,
} from "../actions/attendanceAction";
import { resetState } from "../actions/globalAction";

const initialState = {
  loading: false,
  addAttendance: {
    isVisible: false,
    alreadyMarked: false,
    selectedDate: new Date(),
    attendances: {},
    selectedClass: null,
  },
  attendances: [],
  stats: {
    present: 0,
    absent: 0,
    leave: 0,
  },
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setAttendance(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    setAddAttendance(state, action) {
      state.addAttendance[action.payload.name] = action.payload.value;
    },
    setAddAttendanceStatus(state, action) {
      state.addAttendance.attendances[action.payload.name] =
        action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      // ATTENDANCE
      .addCase(getClassAttendance.pending, (state) => {
        state.loading = true;
        state.addAttendance.attendances = {};
      })
      .addCase(getClassAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const attendances = Array.isArray(action.payload.attendances)
          ? action.payload.attendances
          : [];
        attendances.forEach((item) => {
          state.addAttendance.attendances[item.student._id] = {
            student: item.student._id,
            status: item.status,
            date: new Date(item.date),
            class: item.class._id,
          };
        });
        state.addAttendance.alreadyMarked = attendances.length > 0;
      })
      .addCase(getClassAttendance.rejected, (state) => {
        state.loading = false;
      })

      // ADD / UPDATE ATTENDANCE
      .addCase(addClassAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(addClassAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addClassAttendance.rejected, (state) => {
        state.loading = false;
      })
      // Get Student Attendance By Month
      .addCase(getAttendanceByMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceByMonth.fulfilled, (state, action) => {
        const data = action.payload.attendances;
        state.attendances = data;
        state.loading = false;
      })
      .addCase(getAttendanceByMonth.rejected, (state) => {
        state.loading = false;
      })
      // Get Student Attendance Stats By Month
      .addCase(getAttendanceStatsByMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceStatsByMonth.fulfilled, (state, action) => {
        const data = action.payload.stats;
        state.stats = data;
        state.loading = false;
      })
      .addCase(getAttendanceStatsByMonth.rejected, (state) => {
        state.loading = false;
      })
      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setAttendance, setAddAttendance, setAddAttendanceStatus } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
