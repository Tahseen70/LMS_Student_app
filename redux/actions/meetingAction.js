import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

export const getStudentMeetings = createAsyncThunk(
  "meeting/getStudentMeetings",
  async ({ page = 1, limit = 5 }, { rejectWithValue, dispatch }) => {
    try {
      let params = {
        page,
        limit,
      };
      const resp = await Axios.get("meeting/student", {
        params,
      });

      return resp.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  },
);
