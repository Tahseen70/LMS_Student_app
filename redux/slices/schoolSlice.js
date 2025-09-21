import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getAllcampuses, getAllschools } from "../actions/schoolAction";

const initialState = {
  schools: [],
  campuses: [],
  loading: false,
  selectedCampus: null,
  selectedSchool: null,
};

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    setSchool(state, action) {
      state[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET ALL SCHOOLS
      .addCase(getAllschools.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllschools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload.schools;
      })
      .addCase(getAllschools.rejected, (state) => {
        state.loading = false;
      })

      // GET ALL Campus
      .addCase(getAllcampuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllcampuses.fulfilled, (state, action) => {
        state.loading = false;
        state.campuses = action.payload.campuses;
      })
      .addCase(getAllcampuses.rejected, (state) => {
        state.loading = false;
      })

      // RESET STATE
      .addCase(resetState, (state) => ({
        ...initialState,
        selectedCampus: state.selectedCampus,
        selectedSchool: state.selectedSchool,
      }));
  },
});

export const { setSchool } = schoolSlice.actions;

export default schoolSlice.reducer;
