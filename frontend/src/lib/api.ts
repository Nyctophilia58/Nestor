import axios, { type AxiosError } from "axios";

// Extend AxiosError so TypeScript knows about friendlyMessage
declare module "axios" {
  interface AxiosError {
    friendlyMessage?: string;
  }
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Transform network errors into a consistent format
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // Network error (no response from server)
      error.friendlyMessage =
        "Network error. Please check your connection and try again.";
    } else if (error.response.status >= 500) {
      error.friendlyMessage = "Server error. Please try again later.";
    } else {
      error.friendlyMessage =
        (error.response.data as { message?: string })?.message ||
        "Something went wrong";
    }
    return Promise.reject(error);
  },
);

/** Extract a user-friendly message from an API error */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err) && err.friendlyMessage) {
    return err.friendlyMessage;
  }
  return "Something went wrong";
}

export default api;
