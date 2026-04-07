import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getLessons } from "../actions/lessonAction";
import { getLessonUrl } from "../actions/lessonAction";

const initialState = {
  loading: false,
  allLessons: [],
  lessons: [],
  lessonsPage: 1,
  lessonsHasMore: true,
  lessonUrl: "",
};

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    setLesson(state, action) {
      state[action.payload.name] = action.payload.value;
    },

    // ✅ FIXED RESET
    resetLessons(state) {
      state.allLessons = [];
      state.lessons = [];
      state.lessonsPage = 1;
      state.lessonsHasMore = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // 🔄 REQUEST
      .addCase(getLessons.pending, (state) => {
        state.loading = true;
      })

      // ✅ SUCCESS
      .addCase(getLessons.fulfilled, (state, action) => {
        const data = action.payload?.lessons || {};
        const lessons = Array.isArray(data.lessons) ? data.lessons : [];

        const currentPage = data.currentPage || 1;
        const totalPages = data.totalPages || 1;

        // ✅ RESET if first page
        const mergedLessons =
          currentPage === 1 ? lessons : [...state.allLessons, ...lessons];

        // ✅ REMOVE DUPLICATES (CRITICAL FIX)
        const uniqueLessons = [
          ...new Map(mergedLessons.map((item) => [item._id, item])).values(),
        ];

        state.lessons = lessons;
        state.allLessons = uniqueLessons;
        state.lessonsPage = currentPage;
        state.lessonsHasMore = currentPage < totalPages;

        state.loading = false;
      })

      // ❌ ERROR
      .addCase(getLessons.rejected, (state) => {
        state.loading = false;
      })
      // 🌍 GLOBAL RESET
      .addCase(resetState, () => initialState);
  },
});

export const { setLesson, resetLessons } = lessonSlice.actions;

export default lessonSlice.reducer;
