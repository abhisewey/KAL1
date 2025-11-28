import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Signup
export const signupUser = (formData) =>
  API.post("/signup", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Login
export const loginUser = async (data) => {
  return API.post("/login", data);
};
