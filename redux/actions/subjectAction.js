import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

// Fetch subjects for a selected class
export const getSubjects = createAsyncThunk(
  "subject/getSubjects",
  async (_, thunkAPI) => {
    try {
      const resp = await Axios.get("/subject/student");
      return resp.data;
    } catch (error) {
      console.log("errors in fetching subjects:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
