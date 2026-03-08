import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../services/api";
import { clearAuthUser, getAuthUser, setAuthUser } from "../utils/storage";

const AuthContext = createContext(null);

function roleToDashboardPath(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "teacher") return "/dashboard/teacher";
  return "/dashboard/student";
}

export function AuthProvider({ children, notify }) {
  const [user, setUser] = useState(() => getAuthUser());

  const login = async ({ email, password }) => {
    if (!email || !password) {
      notify?.("Please provide email and password.", "danger");
      return { success: false };
    }

    const { user: apiUser, token } = await api.login({ email, password });

    const nextUser = {
      id: apiUser.id,
      name: apiUser.full_name,
      email: apiUser.email,
      role: apiUser.role,
      token,
    };

    setAuthUser(nextUser);
    setUser(nextUser);
    notify?.("Login successful.", "success");

    return {
      success: true,
      user: nextUser,
      redirectTo: roleToDashboardPath(nextUser.role),
    };
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

    const nextUser = {
      id: apiUser.id,
      name: apiUser.full_name,
      email: apiUser.email,
      role: apiUser.role,
      token,
    };

    setAuthUser(nextUser);
    setUser(nextUser);
    notify?.("Account created successfully.", "success");

    return {
      success: true,
      user: nextUser,
      redirectTo: roleToDashboardPath(nextUser.role),
    };
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
    notify?.("You have been logged out.", "info");
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user?.token),
      role: user?.role || "guest",
      login,
      signup,
      logout,
      notify,
      dashboardPath: roleToDashboardPath(user?.role),
    }),
    [notify, user]
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
  return roleToDashboardPath(role);
}
