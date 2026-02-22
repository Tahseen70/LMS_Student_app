import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Axios = axios.create();

// Interceptor to dynamically set baseURL before each request
Axios.interceptors.request.use(
  async (config) => {
    try {
      let serverUrl = "https://server.graderlms.com";
      // let serverUrl = "https://f03c-2407-d000-8-7f74-1d80-9724-ab89-7d91.ngrok-free.app";

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
