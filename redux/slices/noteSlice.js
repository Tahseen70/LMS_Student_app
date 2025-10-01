import { createSlice } from "@reduxjs/toolkit";
import { resetState } from "../actions/globalAction";
import { getNotes } from "../actions/noteAction";

const initialState = {
  loading: false,
  allNotes: [],
  notes: [],
  notesPage: 1,
  notesHasMore: true,
  viewNotes: {
    selectedNote: null,
    selectedClass: null,
    selectedSubject: null,
    page: 1,
    hasMore: true,
  },
  addNote: {
    name: "",
    note: null,
  },
  updateNote: {
    noteId: "",
    name: "",
    note: null,
    fileName: "",
  },
};

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    setNote(state, action) {
      state[action.payload.name] = action.payload.value;
    },
    setViewNotes(state, action) {
      state.viewNotes[action.payload.name] =
        action.payload.value ?? state.viewNotes[action.payload.name];
    },
    setAddNote(state, action) {
      state.addNote[action.payload.name] = action.payload.value;
    },
    resetAddNote(state, action) {
      state.addNote = initialState.addNote;
    },
    setUpdateNote(state, action) {
      state.updateNote[action.payload.name] = action.payload.value;
    },
    resetNotes(state, action) {
      state.notes = initialState.notes;
      state.allNotes = initialState.allNotes;
      state.notesPage = initialState.notesPage;
      state.notesHasMore = initialState.notesHasMore;
    },
  },
  extraReducers: (builder) => {
    builder
      // Notes
      .addCase(getNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        const data = action.payload?.notes || {};
        const notes = Array.isArray(data.notes) ? data.notes : [];
        state.notes = notes;
        state.allNotes = [...(state.allNotes || []), ...notes];
        state.notesPage = data.currentPage || 1;
        state.notesHasMore = (data.currentPage || 1) < (data.totalPages || 1);
        state.loading = false;
      })
      .addCase(getNotes.rejected, (state) => {
        state.loading = false;
      })
      // RESET STATE
      .addCase(resetState, () => initialState);
  },
});

export const {
  setNote,
  setViewNotes,
  setAddNote,
  resetAddNote,
  setUpdateNote,
  resetNotes,
} = noteSlice.actions;

export default noteSlice.reducer;
