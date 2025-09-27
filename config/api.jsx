import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Axios = axios.create();

// Interceptor to dynamically set baseURL before each request
Axios.interceptors.request.use(
  async (config) => {
    try {
      let serverUrl = "http://localhost:8080"; // fallback
      const schoolStr = await AsyncStorage.getItem("school");
      if (schoolStr) {
        try {
          const parsedSchool = JSON.parse(schoolStr);
          if (parsedSchool?.serverUrl) {
            serverUrl = parsedSchool.serverUrl;
          }
        } catch (err) {
          console.error("Error parsing school from AsyncStorage:", err);
        }
      }

      // Always set baseURL dynamically
      config.baseURL = `${serverUrl}/api`;

      // Set Authorization header if available
      const student = await AsyncStorage.getItem("student");
      const token = await AsyncStorage.getItem("token");
      if (student && token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

export default Axios;
