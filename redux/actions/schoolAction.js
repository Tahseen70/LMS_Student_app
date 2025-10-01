import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "axios";
import { BASE_URL } from "../../config";

export const getAllschools = createAsyncThunk(
  "school/getAllschools",
  async (_, thunkAPI) => {
    try {
      const resp = await Axios.get(`${BASE_URL}/school/all`);
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getAllcampuses = createAsyncThunk(
  "school/campus/all",
  async ({ school }, thunkAPI) => {
    try {
      let params = { school };
      const resp = await Axios.get(`${BASE_URL}/campus/all`, { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);


export const getBank = createAsyncThunk(
  "school/bank",
  async ({ campus }, thunkAPI) => {
    try {
      let params = { campus };
      const resp = await Axios.get(`${BASE_URL}/bank`, { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
