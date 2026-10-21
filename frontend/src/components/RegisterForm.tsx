import { useState, type FormEvent } from "react";
import { signup, ApiRequestError, type User } from "../api/client";

interface RegisterFormProps {
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "El correo electrónico es obligatorio.";
    }
    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    } else if (password.length > 32) {
      errors.password = "La contraseña no puede superar los 32 caracteres.";
    }
    if (password !== passwordConfirmation) {
      errors.passwordConfirmation = "Las contraseñas no coinciden.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(
        "Por favor revisa los errores señalados en el formulario.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await signup({
        fullName: fullName.trim() || null,
        email: email.trim(),
        password,
        passwordConfirmation,
      });
      onSuccess(response.user);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message);
        if (err.errors && err.errors.length > 0) {
          const apiFieldErrors: Record<string, string> = {};
          for (const item of err.errors) {
            if (item.field) {
              apiFieldErrors[item.field] = item.message;
            }
          }
          setFieldErrors(apiFieldErrors);
        }
      } else {
        setErrorMessage("Ocurrió un error inesperado al crear la cuenta.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo-badge">FS</div>
        <h2>Crear cuenta</h2>
        <p>Regístrate para empezar a colaborar con tu equipo</p>
      </div>

      {errorMessage && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="register-name">
            Nombre completo <span className="label-optional">(opcional)</span>
          </label>
          <input
            id="register-name"
            type="text"
            name="fullName"
            autoComplete="name"
            placeholder="Ana López"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="ana@flowsync.dev"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }
            }}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.email}
            className={fieldErrors.email ? "input-error" : ""}
          />
          {fieldErrors.email && (
            <span className="field-error-text">{fieldErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Entre 8 y 32 caracteres"
            maxLength={32}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.password}
            className={fieldErrors.password ? "input-error" : ""}
          />
          {fieldErrors.password && (
            <span className="field-error-text">{fieldErrors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="register-confirm-password">
            Confirmar contraseña
          </label>
          <input
            id="register-confirm-password"
            type="password"
            name="passwordConfirmation"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            maxLength={32}
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              if (fieldErrors.passwordConfirmation) {
                setFieldErrors((prev) => ({
                  ...prev,
                  passwordConfirmation: "",
                }));
              }
            }}
            disabled={isLoading}
            required
            aria-invalid={!!fieldErrors.passwordConfirmation}
            className={fieldErrors.passwordConfirmation ? "input-error" : ""}
          />
          {fieldErrors.passwordConfirmation && (
            <span className="field-error-text">
              {fieldErrors.passwordConfirmation}
            </span>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Registrarse en FlowSync"}
        </button>
      </form>

      <div className="auth-footer">
        <span>¿Ya tienes una cuenta?</span>{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn-link"
          disabled={isLoading}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
