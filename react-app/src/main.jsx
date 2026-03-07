import React, { useCallback, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import "./styles/responsive.css";
import "./styles/course-single.css";
import "./styles/react-overrides.css";
import App from "./App";
import AlertStack from "./components/common/AlertStack";
import { AuthProvider } from "./context/AuthContext";

function Root() {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message, type = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setAlerts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setAlerts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const providerValue = useMemo(() => notify, [notify]);

  return (
    <AuthProvider notify={providerValue}>
      <App />
      <AlertStack alerts={alerts} onDismiss={removeAlert} />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
