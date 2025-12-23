import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Axios = axios.create();

// Interceptor to dynamically set baseURL before each request
Axios.interceptors.request.use(
  async (config) => {
    try {
      let serverUrl = "https://server.graderlms.com/";
      // let serverUrl = "https://a1e8c1d37aaf.ngrok-free.app";

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
