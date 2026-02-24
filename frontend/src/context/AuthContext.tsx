import React, { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import toast from "react-hot-toast";
import type { User, AuthResult, AuthContextValue } from "../types/index";

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    }
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { name, email, password });
      const { token: newToken } = response.data as { token: string };
      localStorage.setItem("token", newToken);
      setToken(newToken);
      await fetchProfile(newToken);
      toast.success("Registration successful!");
      return { success: true };
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
        ?? "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token: newToken, user: userData } = response.data as { token: string; user: User };
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success("Login successful!");
      return { success: true };
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
        ?? "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully!");
  };

  const fetchProfile = async (authToken: string | null = token): Promise<User | null> => {
    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const userData = response.data as User;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error: unknown) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  };

  const updateProfile = async (
    updates: Partial<Pick<User, "name" | "avatar">> & { password?: string }
  ): Promise<AuthResult & { user?: User }> => {
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, updates);
      const updatedUser = (response.data as { user: User }).user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message
        ?? "Failed to update profile.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
