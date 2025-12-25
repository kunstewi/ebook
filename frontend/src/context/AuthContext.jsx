import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name,
        email,
        password,
      });

      const { token: newToken } = response.data;

      // Store token
      localStorage.setItem("token", newToken);
      setToken(newToken);

      // Fetch user profile
      await fetchProfile(newToken);

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      // Store token and user
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully!");
  };

  // Fetch user profile
  const fetchProfile = async (authToken = token) => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        updates
      );

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
