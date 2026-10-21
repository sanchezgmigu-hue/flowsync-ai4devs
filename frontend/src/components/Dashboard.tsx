import { useState, useEffect } from "react";
import { getProfile, logout, ApiRequestError, type User } from "../api/client";

interface DashboardProps {
  initialUser: User;
  onLogout: () => void;
}

export function Dashboard({ initialUser, onLogout }: DashboardProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFreshProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const freshUser = await getProfile();
        if (isMounted) {
          setUser(freshUser);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiRequestError && err.status === 401) {
            onLogout();
          } else {
            setProfileError("No se pudo actualizar la información del perfil.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchFreshProfile();

    return () => {
      isMounted = false;
    };
  }, [onLogout]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Ignoramos error en logout para garantizar que el usuario pueda salir siempre
    } finally {
      setIsLoggingOut(false);
      onLogout();
    }
  };

  const initials =
    user.initials ||
    (user.fullName
      ? user.fullName
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : user.email.slice(0, 2).toUpperCase());

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recientemente";

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="auth-logo-badge">FS</div>
          <span className="brand-title">FlowSync</span>
        </div>

        <div className="header-user-menu">
          <div className="user-avatar-badge">{initials}</div>
          <div className="user-meta">
            <span className="user-name">
              {user.fullName || user.email.split("@")[0]}
            </span>
            <span className="user-email">{user.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn btn-secondary btn-sm"
          >
            {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {profileError && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{profileError}</span>
          </div>
        )}

        <section className="welcome-banner">
          <div className="welcome-avatar">{initials}</div>
          <div className="welcome-text">
            <h2>¡Hola, {user.fullName || user.email}! 👋</h2>
            <p>
              Has iniciado sesión correctamente. Esta es la vista protegida
              consumiendo la API de AdonisJS con autenticación Bearer Token.
            </p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Datos de tu cuenta</h3>
              {isLoadingProfile && (
                <span className="badge-loading">Actualizando...</span>
              )}
            </div>
            <div className="card-body">
              <dl className="info-list">
                <div className="info-item">
                  <dt>ID de Usuario:</dt>
                  <dd>#{user.id}</dd>
                </div>
                <div className="info-item">
                  <dt>Nombre Completo:</dt>
                  <dd>{user.fullName || "No especificado"}</dd>
                </div>
                <div className="info-item">
                  <dt>Correo electrónico:</dt>
                  <dd>{user.email}</dd>
                </div>
                <div className="info-item">
                  <dt>Miembro desde:</dt>
                  <dd>{formattedDate}</dd>
                </div>
                <div className="info-item">
                  <dt>Estado de sesión:</dt>
                  <dd>
                    <span className="badge-status badge-active">
                      ● Token Activo
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Estado del proyecto FlowSync</h3>
            </div>
            <div className="card-body">
              <p className="card-description">
                Has completado la funcionalidad de autenticación de la Sesión 1:
              </p>
              <ul className="checklist">
                <li className="checked">
                  ✅ Registro seguro con validación de contraseña
                </li>
                <li className="checked">
                  ✅ Login con Opaque Access Tokens (OAT)
                </li>
                <li className="checked">
                  ✅ Consumo de endpoint protegido (
                  <code>/api/v1/account/profile</code>)
                </li>
                <li className="checked">
                  ✅ Cierre de sesión e invalidación del token en SQLite
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
