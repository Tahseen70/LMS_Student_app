import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getStudentMeetings } from "../actions/meetingAction";

const initialState = {
  loading: false,
  // Student Meetings
  studentMeeting: {
    items: [],
    allItems: [],
    currentPage: 1,
    resultsPerPage: 5,
    totalPages: 1,
    totalResults: 0,
    hasMore: true,
  },
};

const meetingSlice = createSlice({
  name: "meeting",
  initialState,

  reducers: {
    setMeeting(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    // Reset Student Meetings
    resetStudentMeetings(state) {
      state.studentMeeting = initialState.studentMeeting;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================================
      // Get Student Meetings
      // ==========================================
      .addCase(getStudentMeetings.pending, (state) => {
        state.loading = true;
      })

      .addCase(getStudentMeetings.fulfilled, (state, action) => {
        const data = action.payload?.meetings || {};
        const meetings = Array.isArray(data.meetings) ? data.meetings : [];

        const currentPage = data.currentPage || 1;
        const totalPages = data.totalPages || 1;

        // Merge pages
        const mergedItems =
          currentPage === 1
            ? meetings
            : [...state.studentMeeting.allItems, ...meetings];

        // Remove duplicates using _id
        const uniqueItems = [
          ...new Map(mergedItems.map((item) => [item._id, item])).values(),
        ];

        state.studentMeeting.items = meetings;
        state.studentMeeting.allItems = uniqueItems;
        state.studentMeeting.currentPage = currentPage;
        state.studentMeeting.resultsPerPage = data.resultsPerPage || 5;
        state.studentMeeting.totalPages = totalPages;
        state.studentMeeting.totalResults = data.totalResults || 0;
        state.studentMeeting.hasMore = currentPage < totalPages;

        state.loading = false;
      })

      .addCase(getStudentMeetings.rejected, (state) => {
        state.loading = false;
      })

      // Global Reset
      .addCase(resetState, () => initialState);
  },
});

export const { setMeeting, resetStudentMeetings } = meetingSlice.actions;

export default meetingSlice.reducer;
