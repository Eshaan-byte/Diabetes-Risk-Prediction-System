// Application Configuration
export const CONFIG = {
  // API endpoints
  LOCAL_API: "http://127.0.0.1:8000",
  REMOTE_API: "https://diabetes-risk-prediction-api.onrender.com",
};

// Get the current API base URL, get by the environtmen key or the configured link
export const getApiBase = () => {
  return import.meta.env.VITE_API_BASE || CONFIG.REMOTE_API;
};
