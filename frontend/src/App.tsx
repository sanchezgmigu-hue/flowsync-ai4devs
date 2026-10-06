import { useState, useEffect } from "react";
import {
  getSavedToken,
  getProfile,
  clearToken,
  ApiRequestError,
  type User,
} from "./api/client";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { Dashboard } from "./components/Dashboard";
import "./App.css";

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const verifySession = async () => {
    setIsCheckingSession(true);
    setSessionError(null);

    const token = getSavedToken();
    if (!token) {
      setIsCheckingSession(false);
      return;
    }

    try {
      const user = await getProfile();
      setCurrentUser(user);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        // Solo eliminamos el token si el backend rechaza explícitamente la autenticación
        clearToken();
        setCurrentUser(null);
      } else {
        // Error de red temporal o servidor reiniciándose: no borramos el token
        setSessionError(
          "No se pudo conectar con el servidor para verificar tu sesión. Comprueba que el backend esté activo.",
        );
      }
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
  };

  if (isCheckingSession) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner"></div>
        <p>Cargando FlowSync...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="auth-layout">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div className="auth-header">
              <div className="auth-logo-badge">FS</div>
              <h2>Problema de conexión</h2>
              <p>{sessionError}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={verifySession}
              >
                Reintentar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={handleLogout}
              >
                Iniciar sesión de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <Dashboard initialUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <nav className="auth-tabs" aria-label="Selector de autenticación">
          <button
            type="button"
            className={`tab-btn ${authView === "login" ? "active" : ""}`}
            onClick={() => setAuthView("login")}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`tab-btn ${authView === "register" ? "active" : ""}`}
            onClick={() => setAuthView("register")}
          >
            Crear cuenta
          </button>
        </nav>

        {authView === "login" ? (
          <LoginForm
            onSuccess={(user) => setCurrentUser(user)}
            onSwitchToRegister={() => setAuthView("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={(user) => setCurrentUser(user)}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
      </div>
    </div>
  );
}

export default App;
