# FlowSync

Repositorio de práctica para gestión de tareas en equipo (AI4Devs). Consta de dos aplicaciones independientes en un mismo repositorio (monorepo sin package.json en la raíz).

## Estructura del repositorio

- `backend/`: API REST en AdonisJS 7 (Node.js + TypeScript + SQLite).
- `frontend/`: SPA en React 19 (Vite + TypeScript).

> **Importante**: No ejecutar comandos npm en la raíz del repositorio. Todos los comandos deben ejecutarse dentro de `backend/` o `frontend/` en terminales independientes.

---

## Backend (`backend/`)

- **Stack**: AdonisJS 7, TypeScript, Lucid ORM, VineJS (validación), Better-SQLite3, `@adonisjs/auth` (Access Tokens).
- **Base de datos**: SQLite local (`database/`) gestionada por migraciones Lucid.
- **Autenticación**: Opaque Access Tokens (OAT) enviados mediante cabecera `Authorization: Bearer <token>`.

### Comandos principales (desde `backend/`):
- **Desarrollo**: `npm run dev` (corre en `http://localhost:3333`)
- **Pruebas**: `npm test` o `node ace test`
- **Construcción**: `npm run build`
- **Migraciones**: `node ace migration:run`
- **Generar clave app**: `node ace generate:key`
- **Linter**: `npm run lint`
- **Verificación de tipos**: `npm run typecheck`

### Convenciones de la API:
- Prefijo de endpoints: `/api/v1/`
- Rutas públicas:
  - `POST /api/v1/auth/signup` (campos: `fullName`, `email`, `password`, `passwordConfirmation`)
  - `POST /api/v1/auth/login` (campos: `email`, `password`)
- Rutas protegidas (requieren token Bearer):
  - `GET /api/v1/account/profile`
  - `POST /api/v1/account/logout`

---

## Frontend (`frontend/`)

- **Stack**: React 19, TypeScript, Vite.
- **Linter**: `oxlint`.
- **Formateador**: Prettier (`frontend/src/**`).

### Comandos principales (desde `frontend/`):
- **Desarrollo**: `npm run dev` (corre en `http://localhost:5173`)
- **Construcción**: `npm run build`
- **Linter**: `npm run lint`
- **Preview**: `npm run preview`

---

## Reglas de proceso

- **Antes de tocar código**: crear una rama nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main`/`s1/start`.
- **Al cerrar la tarea**: usar la skill `/commit`, luego `gh pr create` con una descripción completa de los cambios en el cuerpo del PR.
- **Después de abrir el PR**: usar el subagente `adversarial-reviewer` sobre él, antes de darlo por terminado.
- **No repitas ese resumen en el chat**: la sesión se va a perder, el PR no. Responde solo con la URL del PR.
