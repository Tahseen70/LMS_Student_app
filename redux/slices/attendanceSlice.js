import { createSlice } from "@reduxjs/toolkit";
import {
    addClassAttendance,
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
      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setAttendance, setAddAttendance, setAddAttendanceStatus } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
