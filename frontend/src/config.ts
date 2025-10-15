// Application Configuration
export const CONFIG = {
  // API endpoints
  LOCAL_API: "http://127.0.0.1:8000",
  REMOTE_API: "https://diabetes-risk-prediction-api.onrender.com",
};

// Get the current API base URL
export const getApiBase = () => {
  return CONFIG.LOCAL_API; // or CONFIG.REMOTE_API when using remote
};