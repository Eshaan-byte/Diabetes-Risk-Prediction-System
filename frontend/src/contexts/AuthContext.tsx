import React, { createContext, useContext, useState, ReactNode } from 'react';

// The backend URL
const API_BASE = "http://127.0.0.1:8000"; //testing URL
// const API_BASE = "https://diabetes-risk-prediction-api.onrender.com"; 

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string
  token: string;
}

type ResponseResult = {
  success: boolean;
  message: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ResponseResult>;
  signup: (userData: any) => Promise<ResponseResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  //login
  const login = async (email: string, password: string): Promise<ResponseResult> => {
    //API call to /auth/login
    try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const responseData = await res.json(); // parse JSON regardless of status
      console.error("Login failed", responseData.detail);
      return { success: false, message: responseData.detail};
    }

    const data = await res.json();
    // Store user info and token
    setUser({
      id: data.user_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      userName: data.username,
      token: data.access_token
    });
    return { success: true, message: "Login successful", ...data };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error, unable to connect to server" };
  }
  };


  //Signup
  const signup = async (userData: any): Promise<ResponseResult> => {
    try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      const responseData = await res.json(); // parse JSON regardless of status
      console.error("Sign Up failed", responseData.detail);
      return { success: false, message: responseData.detail};
    }

    const data = await res.json();
    setUser({
      id: data.user_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      userName: data.username,
      token: data.access_token
    });
    return { success: true, message: "Sign Up successful", ...data };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Network error, unable to connect to server"};
  }
  };


  //Logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}