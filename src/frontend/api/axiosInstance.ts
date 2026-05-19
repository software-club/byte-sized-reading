import axios from "axios";

const baseURL = "https://localhost:8000/api";

export const instance = axios.create({ baseURL });
