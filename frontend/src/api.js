import axios from 'axios';

// Create a reusable, global axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://helpdesk-ticketing-system-le0p.onrender.com",
  withCredentials: true
});

export default API;
