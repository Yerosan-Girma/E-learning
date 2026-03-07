import { createContext, useContext, useMemo, useState } from "react";
import { clearAuthUser, getAuthUser, setAuthUser } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children, notify }) {
  const [user, setUser] = useState(() => getAuthUser());
  const [activeModal, setActiveModal] = useState(null);

  const openLoginModal = () => setActiveModal("login");
  const openSignupModal = () => setActiveModal("signup");
  const closeModal = () => setActiveModal(null);

  const login = ({ email, password }) => {
    if (!email || !password) {
      notify?.("Please provide email and password.", "danger");
      return false;
    }

    const name = email.split("@")[0].replace(/[._-]/g, " ");
    const normalizedName = name
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const nextUser = {
      name: normalizedName || "Student",
      email,
    };

    setAuthUser(nextUser);
    setUser(nextUser);
    notify?.("Login successful.", "success");
    closeModal();

    return true;
  };

  const signup = ({ firstName, lastName, email, password, confirmPassword, agreeTerms }) => {
    if (!firstName || !lastName || !email || !password) {
      notify?.("Please fill all required fields.", "danger");
      return false;
    }

    if (password !== confirmPassword) {
      notify?.("Passwords do not match.", "danger");
      return false;
    }

    if (!agreeTerms) {
      notify?.("Please agree to terms and conditions.", "danger");
      return false;
    }

    const nextUser = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
    };

    setAuthUser(nextUser);
    setUser(nextUser);
    notify?.("Account created successfully.", "success");
    closeModal();

    return true;
  };

  const logout = () => {
    clearAuthUser();
    setUser(null);
    notify?.("You have been logged out.", "info");
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      activeModal,
      openLoginModal,
      openSignupModal,
      closeModal,
      login,
      signup,
      logout,
      notify,
    }),
    [activeModal, notify, user]
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
