import axios from 'axios';

// Create an Axios instance with base backend URL and credentials enabled
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // Crucial: sends and receives HttpOnly cookies with every request
});

export default api;
