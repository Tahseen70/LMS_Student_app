import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getCourses } from "../actions/courseAction";

const initialState = {
  loading: false,
  allCourses: [],
  courses: [],
  coursesPage: 1,
  coursesHasMore: true,
  selectedCourse: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourse(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    resetCourses(state, action) {
      state.notes = initialState.notes;
      state.allCourses = initialState.allCourses;
      state.coursesPage = initialState.coursesPage;
      state.coursesHasMore = initialState.coursesHasMore;
    },
  },
  extraReducers: (builder) => {
    builder
      // Notes
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        const data = action.payload?.courses || {};
        const courses = Array.isArray(data.courses) ? data.courses : [];
        state.courses = courses;
        state.allCourses = [...(state.allCourses || []), ...courses];
        state.coursesPage = data.currentPage || 1;
        state.coursesHasMore = (data.currentPage || 1) < (data.totalPages || 1);
        state.loading = false;
      })
      .addCase(getCourses.rejected, (state) => {
        state.loading = false;
      })
      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setCourse, resetCourses } = courseSlice.actions;

export default courseSlice.reducer;
