import { useContext } from "react";
import { AuthContext } from "../context/Authcontext";

// Main auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }

  return context;
};

// Hook specifically for auth context
export const useAuthContext = () => {
  return useAuth();
};

// Hook for login functionality
export const useLogin = () => {
  const { login, isLoading, error } = useAuth();
  
  return {
    login,
    isLoading,
    error,
  };
};

// Hook for logout functionality
export const useLogout = () => {
  const { logout, isLoading } = useAuth();
  
  return {
    logout,
    isLoading,
  };
};

// Hook for registration functionality
export const useRegister = () => {
  const { register, isLoading, error } = useAuth();
  
  return {
    register,
    isLoading,
    error,
  };
};

// Hook to check authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    token,
  };
};

// Hook for user data management
export const useUser = () => {
  const { user, updateUser, isLoading } = useAuth();
  
  return {
    user,
    updateUser,
    isLoading,
  };
};

export default useAuth;