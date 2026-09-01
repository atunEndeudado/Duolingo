# Autenticación en TuboLingo - Frontend

## 📋 Descripción General

Se ha implementado un flujo completo de autenticación con:
- **Login**: Usuario inicia sesión con email + contraseña
- **Registro**: Usuario se registra (ya existía, actualizado para redirigir a dashboard tras registro)
- **Sesión persistente**: Token guardado en localStorage
- **Rutas protegidas**: Acceso restringido a usuarios autenticados
- **Logout**: Cierre de sesión con limpieza del token

---

## 🔧 Archivos Creados

### 1. **src/services/authService.ts**
Servicio de autenticación que maneja las llamadas al backend.

**Métodos:**
- `login(email: string, password: string): Promise<string>` - Llama a `POST /auth/login` y devuelve el token
- `logout(): void` - Elimina el token del localStorage
- `getToken(): string | null` - Obtiene el token actual
- `isAuthenticated(): boolean` - Verifica si hay sesión activa

**Configuración:**
- URL del backend: `process.env.VITE_AUTH_API_URL` (default: `http://127.0.0.1:8005`)

### 2. **src/lib/authContext.tsx**
Contexto de React que proporciona el estado de autenticación a la app.

**Hook: `useAuth()`**
Devuelve:
```typescript
{
  token: string | null           // Token JWT actual
  isAuthenticated: boolean       // Si hay sesión activa
  isLoading: boolean            // Si se está restaurando la sesión
  login: (email, password) => Promise<void>   // Función para login
  logout: () => void            // Función para logout
}
```

**Comportamiento:**
- Al montar, restaura la sesión si hay token en localStorage
- Muestra toast (notificación) al login/logout/error
- Guarda el token en localStorage bajo `"access_token"`

### 3. **src/lib/routeGuards.ts**
Guardias de ruta para proteger acceso.

**Funciones:**
- `requireAuth()` - Redirige a `/login` si no está autenticado (usar en rutas protegidas)
- `redirectIfAuthenticated()` - Redirige a `/` si YA está autenticado (usar en `/login` y `/registro`)

**Uso en rutas:**
```typescript
export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  component: Dashboard,
});
```

### 4. **src/routes/login.tsx**
Página de login con formulario email + password.

**Features:**
- Validación HTML (required fields)
- Botón "Cargando..." durante envío
- Link a "Registrarme" si no tiene cuenta
- Desactiva inputs mientras se procesa
- Redirección automática a `/` tras login exitoso
- Muestra errores via toast

---

## 🔄 Flujo de Autenticación

```
1. Usuario llega a /login
   ↓
   ├─ Si está autenticado → redirect /
   └─ Si no → muestra formulario

2. Usuario ingresa email + password y envía
   ↓
   AuthService.login(email, password)
   ├─ POST /auth/login al backend
   ├─ Si OK → devuelve token
   └─ Si error → lanza Error

3. AuthContext recibe el token
   ├─ Guarda en localStorage("access_token")
   ├─ Actualiza state
   ├─ Muestra toast "Sesión iniciada"
   └─ Redirecciona a /

4. Usuario navega a ruta protegida (ej. /cursos)
   ├─ beforeLoad: requireAuth se ejecuta
   ├─ Si no hay token → redirect /login
   └─ Si hay token → permite acceso

5. En el header (AppShell):
   ├─ Si isAuthenticated → muestra XP, racha, botón logout
   └─ Si no → muestra botones login/registro

6. Usuario hace logout
   ├─ onClick → useAuth().logout()
   ├─ Limpia localStorage
   ├─ Muestra toast "Sesión cerrada"
   └─ Reset a /
```

---

## 🛡️ Rutas Protegidas

Las siguientes rutas requieren autenticación (`beforeLoad: requireAuth`):
- `/cursos` - Catálogo de cursos
- `/cursos/:cursoId` - Detalles de un curso
- `/perfil` - Perfil del usuario
- `/insignias` - Insignias conseguidas
- `/amigos` - Amigos y solicitudes
- `/actividad` - Gráfico de actividad
- `/premium` - Planes premium
- `/ranking` - Rankings global/semanal

---

## 📍 Rutas Públicas (con redirect si autenticado)

Estas rutas redirigen a `/` si el usuario YA está autenticado (`beforeLoad: redirectIfAuthenticated`):
- `/login` - Formulario de login
- `/registro` - Formulario de registro

---

## 🔌 Integración con el Backend

**Endpoint esperado:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "contraseña"
}

Response (200 OK):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}

Error (401, 400, etc):
{
  "detail": "Credenciales inválidas"
}
```

**Variables de entorno:**
```
VITE_AUTH_API_URL=http://127.0.0.1:8005
```

(default: `http://127.0.0.1:8005` si no está definido)

---

## 🎨 UI/UX Cambios

### Header (AppShell.tsx)
**Antes (sin autenticación):**
```
🐸 tuboLingo     [Registrarme]
```

**Después (con autenticación):**
```
🐸 tuboLingo     [🔥 5] [⚡ 150 XP] [Juan] [Logout]
```

### Links dinámicos
- Si está autenticado:
  - Botón "Iniciar sesión" → ocultado
  - Botón "Registrarme" → ocultado
  - Botón "Logout" → visible

- Si NO está autenticado:
  - Botón "Iniciar sesión" → visible
  - Botón "Registrarme" → visible
  - Botón "Logout" → ocultado

---

## 🔐 Seguridad

1. **localStorage**: Token guardado en navegador (accessible via JS)
   - ⚠️ Vulnerable a XSS
   - ✅ OK para MVP, considerar httpOnly cookies para producción

2. **Sin validación de token en frontend**: El backend valida la firma
   - No hay re-codificación del token
   - El backend es la fuente de verdad

3. **CORS**: Configurado en backend para aceitar requests desde frontend

---

## ✅ Checklist de Implementación

- ✅ Servicio de login (authService.ts)
- ✅ Contexto de autenticación con localStorage (authContext.tsx)
- ✅ Página de login con formulario (login.tsx)
- ✅ Route guards (routeGuards.ts)
- ✅ Protección de rutas principales (beforeLoad: requireAuth)
- ✅ Redirect si autenticado (beforeLoad: redirectIfAuthenticated)
- ✅ Header con logout (AppShell.tsx)
- ✅ Compilación sin errores

---

## 🧪 Cómo Probar

1. **Navega a /login**
   ```
   http://localhost:8082/login
   ```

2. **Intenta login sin credenciales válidas**
   - Debe mostrar error del backend

3. **Usa credenciales válidas** (crear usuario primero en /registro)
   - Debe redirigir a `/`
   - Token debe aparecer en localStorage
   - Header debe mostrar XP/racha/logout

4. **Intenta acceder a ruta protegida sin login**
   - Debe redirigir a `/login`

5. **Click en Logout**
   - Token debe borrarse de localStorage
   - Debe redirigir a `/`
   - Header debe volver a mostrar login/registro

6. **Reload página** (si hay sesión guardada)
   - Debe restaurar automáticamente

---

## 🐛 Troubleshooting

### "POST /auth/login 404 o CORS error"
- Verificar que backend esté corriendo en `http://127.0.0.1:8005`
- Verificar CORS habilitado en backend
- Verificar ruta exacta: `/auth/login` (sin `/api` prefix)

### "Token no se guarda"
- Abrir DevTools → Application → localStorage
- Buscar key `"access_token"`
- Si no está: revisar authContext.tsx

### "Rutas protegidas no funcionan"
- Verificar que beforeLoad: requireAuth está en el Route definition
- Verificar que routeTree.gen.ts se regeneró (Vite debe hacerlo automático)

---

## 📚 Referencias

- [TanStack Router Docs](https://tanstack.com/router/latest/docs/framework/react/api/router/Router)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [localStorage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
