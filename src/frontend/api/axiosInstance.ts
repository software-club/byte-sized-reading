import axios from "axios";

export const baseURL = "http://localhost:8000";
const apiBaseURL = `${baseURL}/api`;

export const instance = axios.create({ baseURL: apiBaseURL });
