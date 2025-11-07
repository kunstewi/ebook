// Import React and routing utilities
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// ProtectedRoute component to guard private pages
const ProtectedRoute = ({ children }) => {
  // Simulated authentication and loading state
  const isAuthenticated = true;
  const loading = false;
  const location = useLocation();

  // Show loading state if needed
  if (loading) {
    // You can add a loading spinner here if you want
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow access if authenticated
  return children;
};

// Export the ProtectedRoute component
export default ProtectedRoute;
