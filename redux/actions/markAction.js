import { createAsyncThunk } from "@reduxjs/toolkit";
import Axios from "../../config/api";

// Fetch All exams
export const getAllExams = createAsyncThunk(
  "marks/getAllExams",
  async (_, thunkAPI) => {
    try {
      const resp = await Axios.get(`/exam/all`);
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getStudentExams = createAsyncThunk(
  "exam/student",
  async ({ examId }, { rejectWithValue }) => {
    try {
      let params = {
        examId,
      };
      const resp = await Axios.get("/exam/student", {
        params,
      });

      return resp.data;
    } catch (error) {
      // Use rejectWithValue to pass error messages to the reducer
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const getAllGrades = createAsyncThunk(
  "marks/getAllGrades",
  async (_, thunkAPI) => {
    try {
      const resp = await Axios.get("grades/all");
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Add marks for students
export const addClassMarks = createAsyncThunk(
  "marks/addClassMarks",
  async ({ classId, examId, subjectId, marks }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      formData.append("examId", String(examId));
      formData.append("subjectId", String(subjectId));
      formData.append("marks", JSON.stringify(marks));
      const resp = await Axios.post("/exam/results", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Add Exam
export const addExam = createAsyncThunk(
  "marks/addExam",
  async ({ subject, exam, classId, totalMarks, studentResults }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      formData.append("subject", String(subject));
      formData.append("exam", String(exam));
      formData.append("totalMarks", Number(totalMarks));
      formData.append("studentResults", JSON.stringify(studentResults));
      const resp = await Axios.post("/exam/results", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Update Exam
export const updateExam = createAsyncThunk(
  "marks/updateExam",
  async ({ resultId, totalMarks, studentResults }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("resultId", String(resultId));
      formData.append("totalMarks", Number(totalMarks));
      formData.append("studentResults", JSON.stringify(studentResults));
      const resp = await Axios.post("/exam/updateResults", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Get Teachers Added Exams
export const getTeacherExamResult = createAsyncThunk(
  "marks/getTeacherExamResult",
  async ({ subject, exam, classId }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("classId", String(classId));
      formData.append("subject", String(subject));
      formData.append("exam", String(exam));
      let params = {
        subject,
        exam,
        classId,
      };
      const resp = await Axios.get("/exam/teacher/result", { params });
      return resp.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
