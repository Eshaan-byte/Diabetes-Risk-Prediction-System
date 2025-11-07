import { createContext, useContext, useState, ReactNode } from 'react';
import { getApiBase } from '../config';
import { useEffect } from "react";

const API_BASE = getApiBase(); 

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
  email?: string; // Optional email from the response (used for verification errors)
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

  // Get the locally saved login user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  //login
  const login = async (email: string, password: string): Promise<ResponseResult> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const responseData = await res.json();
        console.error("Login failed", responseData.detail);

        // Handle structured error response (for email verification errors)
        if (typeof responseData.detail === 'object' && responseData.detail.message) {
          return {
            success: false,
            message: responseData.detail.message,
            email: responseData.detail.email // Include the actual email from database
          };
        }

        // Handle simple string error response
        return { success: false, message: responseData.detail};
      }

      // wait for response from api
      const data = await res.json();

      // store the received login information
      const loggedInUser = {
        id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        userName: data.username,
        token: data.access_token
      };

      // Set the state user to the logged user
      setUser(loggedInUser);

      // Store the login locally, so it wont logout on web refresh
      localStorage.setItem("user", JSON.stringify(loggedInUser));

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
        const responseData = await res.json();
        console.error("Sign Up failed", responseData.detail);
        return { success: false, message: responseData.detail};
      }

      const data = await res.json();
      console.log(data.verification_link)
      // Don't set user state on signup - user needs to verify email first
      return { success: true, message: data.message || "Sign Up successful. Please check your email to verify your account.", ...data };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Network error, unable to connect to server"};
    }
  };


  //Logout
  const logout = () => {
    //set user state to null
    setUser(null);
    //Remove the local login information
    localStorage.removeItem("user");
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