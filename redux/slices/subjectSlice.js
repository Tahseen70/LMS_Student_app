import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getSubjects } from "../actions/subjectAction";

const initialState = {
  loading: false,
  subjects: [],
};

const subjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {
    setSubject(state, action) {
      state[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      // SUBJECTS
      .addCase(getSubjects.pending, (state) => {
        state.loading = true;
        state.subjects = [];
      })
      .addCase(getSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload.subjects;
      })
      .addCase(getSubjects.rejected, (state) => {
        state.loading = false;
      })
      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const { setSubject } = subjectSlice.actions;

export default subjectSlice.reducer;
