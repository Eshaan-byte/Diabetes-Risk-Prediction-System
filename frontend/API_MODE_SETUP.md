# API Mode Configuration

This application can run in two modes:

## 🟢 Demo Mode (Current: ENABLED)
- Works offline without backend
- Uses mock data and demo credentials
- Perfect for testing and development

## 🔵 API Mode (Current: DISABLED)
- Connects to actual backend API
- Requires running backend server
- Uses real authentication and database

## How to Switch Modes

### Option 1: Edit Config File (Recommended)
Edit `src/config.ts`:

```typescript
export const CONFIG = {
  // Change this line to switch modes:
  USE_DEMO_MODE: false,  // Set to false for API mode
  
  // Choose API endpoint:
  LOCAL_API: "http://127.0.0.1:8000",
  REMOTE_API: "https://diabetes-risk-prediction-api.onrender.com",
};

// Update this function to use remote API:
export const getApiBase = () => {
  return CONFIG.REMOTE_API; // Change from LOCAL_API to REMOTE_API
};
```

### Option 2: Quick Toggle Comments
In both `AuthContext.tsx` and `DataContext.tsx`, look for:
```typescript
const USE_DEMO_MODE = true; // Change to false for API mode
```

## Demo Credentials
- **Username:** demo@test.com
- **Password:** demo123

## API Mode Requirements
1. Backend server running on specified port
2. Database properly configured
3. All API endpoints functional

## Current Features Working in Both Modes:
- ✅ Authentication (login/logout)
- ✅ Dashboard with charts
- ✅ Add new health records
- ✅ View/Edit/Delete records
- ✅ CSV upload and parsing
- ✅ Record editing functionality