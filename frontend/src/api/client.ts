const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'

const TOKEN_KEY = 'flowsync_auth_token'

export interface User {
  id: number
  fullName: string | null
  email: string
  initials?: string
  createdAt?: string
  updatedAt?: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface SignupPayload {
  fullName?: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ValidationErrorItem {
  message: string
  field?: string
  rule?: string
}

export class ApiRequestError extends Error {
  status: number
  errors: ValidationErrorItem[]

  constructor(
    message: string,
    status: number,
    errors: ValidationErrorItem[] = []
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.errors = errors
  }
}

// Helpers para gestionar el token en localStorage
export function getSavedToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Función genérica de petición con gestión centralizada de cabeceras y errores
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getSavedToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiRequestError(
      'No se pudo conectar con el servidor. ¿Está el backend encendido en el puerto 3333?',
      0
    )
  }

  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    let mainMessage = 'Ocurrió un error al procesar la solicitud'
    let validationErrors: ValidationErrorItem[] = []

    if (data?.errors && Array.isArray(data.errors)) {
      validationErrors = data.errors
      mainMessage = data.errors.map((e: ValidationErrorItem) => e.message).join('. ')
    } else if (data?.message) {
      mainMessage = data.message
    } else if (response.status === 401) {
      mainMessage = 'Sesión no válida o expirada. Por favor inicia sesión de nuevo.'
    } else if (response.status === 400) {
      mainMessage = 'Credenciales no válidas. Revisa el correo y la contraseña.'
    }

    throw new ApiRequestError(mainMessage, response.status, validationErrors)
  }

  return data as T
}

/**
 * Registro de nueva cuenta (POST /api/v1/auth/signup)
 * El serializador de Adonis envuelve la respuesta en { data: { user, token } }
 */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const body = {
    fullName: payload.fullName ? payload.fullName.trim() : null,
    email: payload.email.trim(),
    password: payload.password,
    passwordConfirmation: payload.passwordConfirmation,
  }

  const raw = await request<{ data?: AuthResponse } & AuthResponse>(
    '/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )

  const result: AuthResponse = raw.data ? raw.data : raw

  if (result.token) {
    saveToken(result.token)
  }
  return result
}

/**
 * Inicio de sesión (POST /api/v1/auth/login)
 * El serializador de Adonis envuelve la respuesta en { data: { user, token } }
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const raw = await request<{ data?: AuthResponse } & AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
    }
  )

  const result: AuthResponse = raw.data ? raw.data : raw

  if (result.token) {
    saveToken(result.token)
  }
  return result
}

/**
 * Obtener perfil del usuario autenticado (GET /api/v1/account/profile)
 * Adonis devuelve { data: { id, fullName, email, ... } }
 */
export async function getProfile(): Promise<User> {
  const raw = await request<{ data?: User } & User>('/account/profile', {
    method: 'GET',
  })
  return raw.data ? raw.data : raw
}

/**
 * Cerrar sesión e invalidar token en el servidor (POST /api/v1/account/logout)
 */
export async function logout(): Promise<void> {
  try {
    await request<{ message: string }>('/account/logout', {
      method: 'POST',
    })
  } finally {
    clearToken()
  }
}

