import { useState, useEffect } from "react";
import api from "../api";

/**
 * Custom hook to get current user information
 * Since tokens are in httpOnly cookies, we need to fetch user data from API
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/accounts/profile/");
      console.log("👤 User fetched:", response.data);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = () => {
    if (!user) return null;

    // Приоритет проверки: admin > lecturer > parent > student
    if (user.is_superuser || user.is_staff) {
      console.log("🔑 Role detected: admin");
      return "admin";
    }
    if (user.is_lecturer) {
      console.log("🔑 Role detected: lecturer");
      return "lecturer";
    }
    if (user.is_parent) {
      console.log("🔑 Role detected: parent");
      return "parent";
    }
    if (user.is_student) {
      console.log("🔑 Role detected: student");
      return "student";
    }

    console.log("⚠️ No role detected for user:", user);
    return null;
  };

  return {
    user,
    loading,
    error,
    role: getUserRole(),
    refetch: fetchUser,
  };
};
