import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import {
  addClassMarks,
  getAllExams,
  getTeacherExamResult,
} from "../actions/markAction";

const initialState = {
  loading: false,
  exams: [],
  allExams: [],
  marksInfo: {
    resultId: null,
    selectedClass: null,
    selectedExam: null,
    selectedSubject: null,
    totalMarks: "",
    marks: {},
    alreadyGraded: false,
  },
};

const marksSlice = createSlice({
  name: "marks",
  initialState,
  reducers: {
    setMarks(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    setMarksInfo(state, action) {
      state.marksInfo[action.payload.name] = action.payload.value;
    },
    setMarksValue(state, action) {
      state.marksInfo.marks[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Exams
      .addCase(getAllExams.pending, (state) => {
        state.loading = true;
        state.allExams = [];
      })
      .addCase(getAllExams.fulfilled, (state, action) => {
        state.loading = false;
        state.allExams = action.payload.exams;
      })
      .addCase(getAllExams.rejected, (state) => {
        state.loading = false;
      })
      // ADD MARKS (INDEPENDENT OF ATTENDANCE)
      .addCase(addClassMarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(addClassMarks.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addClassMarks.rejected, (state) => {
        state.loading = false;
      })
      // Get Exam Result for Student
      .addCase(getTeacherExamResult.pending, (state) => {
        state.loading = true;
        state.marksInfo.marks = {};
      })
      .addCase(getTeacherExamResult.fulfilled, (state, action) => {
        const results = action.payload.results;
        const studentResults = Array.isArray(results?.studentResults)
          ? results?.studentResults
          : [];
        studentResults.forEach((item) => {
          state.marksInfo.marks[item.student] = item;
        });
        state.marksInfo.totalMarks = results?.totalMarks.toString();
        state.marksInfo.alreadyGraded = studentResults?.length > 0;
        state.marksInfo.resultId = results?._id;
        state.loading = false;
      })
      .addCase(getTeacherExamResult.rejected, (state) => {
        state.loading = false;
      })

      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setMarks, setMarksInfo, setMarksValue } = marksSlice.actions;

export default marksSlice.reducer;
