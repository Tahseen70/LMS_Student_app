import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const getLessons = createAsyncThunk(
  "course/getCourses",
  async ({ course, page, limit }, thunkAPI) => {
    try {
      let params = {
        course,
        page,
        limit,
      };
      const resp = await Axios.get("/course/lesson/student", { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const getLessonUrl = createAsyncThunk(
  "course/getLessonUrl",
  async ({ lessonId }, thunkAPI) => {
    try {
      let params = {
     lessonId
      };
      const resp = await Axios.get("/course/lesson/url", { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
