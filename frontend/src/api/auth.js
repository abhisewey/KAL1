import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Signup
export const signupUser = async (formData) => {
  return API.post("/signup", formData);
};

// Login
export const loginUser = async (data) => {
  return API.post("/login", data);
};
