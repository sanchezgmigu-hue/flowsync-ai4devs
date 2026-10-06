import { useState, type FormEvent } from "react";
import { login, ApiRequestError, type User } from "../api/client";

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage(
        "Por favor introduce tu correo electrónico y tu contraseña.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });
      onSuccess(response.user);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocurrió un error inesperado al iniciar sesión.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">FS</div>
        <h2>Iniciar sesión</h2>
        <p>Introduce tus credenciales para acceder a FlowSync</p>
      </div>

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ejemplo@flowsync.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoFocus
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            maxLength={32}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            aria-invalid={!!errorMessage}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Entrar a FlowSync"}
        </button>
      </form>

      <div className="auth-footer">
        <span>¿No tienes una cuenta?</span>{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="btn-link"
          disabled={isLoading}
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
