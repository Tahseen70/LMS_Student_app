import { combineReducers, configureStore } from "@reduxjs/toolkit";
import attendanceSlice from "./slices/attendanceSlice";
import marksSlice from "./slices/marksSlice";
import noteSlice from "./slices/noteSlice";
import schoolSlice from "./slices/schoolSlice";
import studentSlice from "./slices/studentSlice";
import subjectSlice from "./slices/subjectSlice";
import teacherSlice from "./slices/teacherSlice";

// Combine your reducers
const rootReducer = combineReducers({
  Teacher: teacherSlice,
  School: schoolSlice,
  Note: noteSlice,
  Attendance: attendanceSlice,
  Marks: marksSlice,
  Subject: subjectSlice,
  Student: studentSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});
