import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getClassStudents } from "../actions/studentAction";

const initialState = {
  loading: false,
  students: [],
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudent(state, action) {
      state[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
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
      // RESET STATE
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
} = studentSlice.actions;

export default studentSlice.reducer;
