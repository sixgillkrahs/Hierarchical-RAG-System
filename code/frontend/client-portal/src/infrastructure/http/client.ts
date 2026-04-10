import axios from 'axios';

const baseURL = import.meta.env.VITE_BASEURL || 'http://localhost:3000/api/v1';

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);
