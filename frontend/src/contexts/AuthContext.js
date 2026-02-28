// src/contexts/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext();

// Create the hook
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch (error) {
      console.error("Error syncing user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUser();

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        syncUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncUser]);

  const login = (userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error during login:", error);
      return null;
    }
  };

  const logout = useCallback(() => {
    try {
      // First set loading to true to prevent any unwanted renders
      setLoading(true);
      
      // Clear all auth-related items from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      
      // Clear the user state
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Finally set loading to false
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    syncUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Explicitly export useAuth as named export
// export { useAuth };
