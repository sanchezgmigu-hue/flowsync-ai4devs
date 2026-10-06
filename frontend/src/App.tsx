import { useState, useEffect } from "react";
import { getSavedToken, getProfile, clearToken, type User } from "./api/client";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { Dashboard } from "./components/Dashboard";
import "./App.css";

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  useEffect(() => {
    let isMounted = true;

    const checkExistingSession = async () => {
      const token = getSavedToken();
      if (!token) {
        if (isMounted) setIsCheckingSession(false);
        return;
      }

      try {
        const user = await getProfile();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch {
        // Si el token guardado ya no es válido, lo limpiamos
        clearToken();
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner"></div>
        <p>Cargando FlowSync...</p>
      </div>
    );
  }

  if (currentUser) {
    return (
      <Dashboard
        initialUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
    );
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
