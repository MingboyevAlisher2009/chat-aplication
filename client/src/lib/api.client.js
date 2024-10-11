import { HOST } from "@/utils/constants";
import axios from "axios";

const apiClient = axios.create({
  baseURL: HOST,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default apiClient;
