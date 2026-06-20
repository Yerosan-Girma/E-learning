import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { clearAuthUser, getAuthUser, setAuthUser } from "../utils/storage";

const AuthContext = createContext(null);

function roleToDashboardPath(role, studentHasEnrollments) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "teacher") return "/dashboard/teacher";
  return studentHasEnrollments === false ? "/courses" : "/dashboard/student";
}

export function AuthProvider({ children, notify }) {
  const [user, setUser] = useState(() => getAuthUser());
  const [studentHasEnrollments, setStudentHasEnrollments] = useState(null);

  const refreshStudentState = async () => {
    const currentUser = getAuthUser();

    if (!currentUser?.token || currentUser.role !== "student") {
      setStudentHasEnrollments(null);
      return false;
    }

    try {
      const data = await api.myEnrollments();
      const hasEnrollments = Boolean((data.enrollments || []).length);
      setStudentHasEnrollments(hasEnrollments);
      return hasEnrollments;
    } catch {
      setStudentHasEnrollments(false);
      return false;
    }
  };

  useEffect(() => {
    if (user?.role === "student") {
      refreshStudentState();
      return;
    }

    setStudentHasEnrollments(null);
  }, [user?.id, user?.role]);

  const finishAuth = async (apiUser, token, successMessage = "Login successful.") => {
    const nextUser = {
      id: apiUser.id,
      name: apiUser.full_name,
      email: apiUser.email,
      role: apiUser.role,
      token,
    };

    setAuthUser(nextUser);
    setUser(nextUser);

    let hasEnrollments = null;
    if (nextUser.role === "student") {
      hasEnrollments = await refreshStudentState();
    } else {
      setStudentHasEnrollments(null);
    }

    notify?.(successMessage, "success");

    return {
      success: true,
      user: nextUser,
      redirectTo: roleToDashboardPath(nextUser.role, hasEnrollments),
    };
  };

  const login = async ({ email, password }) => {
    if (!email || !password) {
      notify?.("Please provide email and password.", "danger");
      return { success: false };
    }

    const { user: apiUser, token } = await api.login({ email, password });
    return finishAuth(apiUser, token, "Login successful.");
  };

  const signup = async ({ fullName, firstName, lastName, email, password, confirmPassword, role }) => {
    const resolvedName = fullName || `${firstName || ""} ${lastName || ""}`.trim();

    if (!resolvedName || !email || !password) {
      notify?.("Please fill all required fields.", "danger");
      return { success: false };
    }

    if (password !== confirmPassword) {
      notify?.("Passwords do not match.", "danger");
      return { success: false };
    }

    const { user: apiUser, token } = await api.register({
      fullName: resolvedName,
      email,
      password,
      role: role || "student",
    });
    return finishAuth(apiUser, token, "Account created successfully.");
  };

  const accessLearner = async ({ fullName, email, password }) => {
    if (!fullName || !email || !password) {
      notify?.("Please provide full name, email, and password.", "danger");
      return { success: false };
    }

    try {
      const { user: apiUser, token } = await api.register({
        fullName,
        email,
        password,
        role: "student",
      });

      setStudentHasEnrollments(false);
      return finishAuth(apiUser, token, "Welcome.");
    } catch (error) {
      if (error.status !== 409) {
        throw error;
      }
    }

    const { user: apiUser, token } = await api.login({ email, password });

    if (apiUser.role !== "student") {
      throw new Error("Use the default admin or teacher login.");
    }

    return finishAuth(apiUser, token, "Welcome back.");
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
    setStudentHasEnrollments(null);
    notify?.("You have been logged out.", "info");
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user?.token),
      role: user?.role || "guest",
      login,
      signup,
      accessLearner,
      refreshStudentState,
      logout,
      notify,
      dashboardPath: roleToDashboardPath(user?.role, studentHasEnrollments),
    }),
    [notify, studentHasEnrollments, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export function getDashboardPathByRole(role) {
  return roleToDashboardPath(role, true);
}
