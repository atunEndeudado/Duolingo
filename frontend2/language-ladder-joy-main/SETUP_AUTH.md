# 🚀 Guía de Setup - Autenticación Frontend

## Requisitos Previos

1. **Backend corriendo** en `http://127.0.0.1:8005`
   - Endpoint: `POST /auth/login`
   - Response: `{ "access_token": "...", "token_type": "bearer" }`

2. **Frontend corriendo** en `http://localhost:8082`
   - `npm run dev -- --host 0.0.0.0`

3. **Variables de entorno** (opcional)
   - Si el backend está en otra URL, crear `.env.local`:
     ```
     VITE_AUTH_API_URL=http://tu-backend:8005
     ```

---

## Archivos Implementados

```
src/
├── services/
│   └── authService.ts          ← Servicio HTTP de login
├── lib/
│   ├── authContext.tsx         ← Contexto + Provider
│   └── routeGuards.ts          ← Guardias de ruta
├── routes/
│   ├── __root.tsx              ← AuthProvider wrapping
│   ├── login.tsx               ← Nueva página de login
│   ├── registro.tsx            ← Actualizado con redirect guard
│   ├── cursos.index.tsx        ← Protegido
│   ├── cursos.$cursoId.tsx     ← Protegido
│   ├── perfil.tsx              ← Protegido
│   ├── insignias.tsx           ← Protegido
│   ├── amigos.tsx              ← Protegido
│   ├── actividad.tsx           ← Protegido
│   ├── premium.tsx             ← Protegido
│   └── ranking.tsx             ← Protegido
└── components/
    └── AppShell.tsx            ← Header con logout
```

---

## Quick Start para Desarrolladores

### 1. Verificar Backend

```bash
# Terminal 1: Backend
cd c:\Duolingo\backend
.\ven\Scripts\python.exe -m uvicorn src.app:app --host 127.0.0.1 --port 8005
```

Verificar que responde:
```bash
curl -X POST http://127.0.0.1:8005/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Arrancar Frontend

```bash
# Terminal 2: Frontend
cd c:\Duolingo\frontend2\language-ladder-joy-main
$env:Path += ";C:\Program Files\nodejs"
npm run dev -- --host 0.0.0.0
```

### 3. Probar en Navegador

1. Ir a `http://localhost:8082`
2. Click en "Registrarme" → crear usuario
3. Click en "Iniciar sesión" (o acceder a `http://localhost:8082/login`)
4. Ingresar credenciales
5. Debe redirigir a `/` y mostrar XP/racha en header

---

## Flujo de Desarrollo

### Agregar Rutas Protegidas

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";

export const Route = createFileRoute("/my-protected-route")({
  beforeLoad: requireAuth,  // ← Agregá esto
  head: () => ({ ... }),
  component: MyComponent,
});
```

### Usar Contexto de Auth en Componentes

```typescript
import { useAuth } from "@/lib/authContext";

function MyComponent() {
  const { token, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <p>Not logged in</p>;
  
  return (
    <div>
      <p>Token: {token?.substring(0, 20)}...</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Hacer Llamadas HTTP Autenticadas

```typescript
import { useAuth } from "@/lib/authContext";

function MyComponent() {
  const { token } = useAuth();
  
  const fetchUserData = async () => {
    const res = await fetch("http://127.0.0.1:8005/api/users/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return res.json();
  };
  
  // ...
}
```

---

## Debugging

### Ver Token en localStorage

```javascript
// En DevTools Console
localStorage.getItem("access_token")
```

### Ver estado del contexto

```typescript
const { token, isAuthenticated, isLoading } = useAuth();
console.log({ token, isAuthenticated, isLoading });
```

### Simular logout programático

```typescript
const { logout } = useAuth();
logout();  // Limpia todo
```

---

## Build para Producción

```bash
npm run build
# → Genera .output/public con build optimizado
```

---

## Notas Importantes

1. ⚠️ **Token en localStorage**: Es vulnerable a XSS. Para producción, considerar:
   - httpOnly cookies (más seguro pero requiere backend setup)
   - Refresh token rotation
   - CSRF protection

2. 🔐 **CORS**: El backend debe permitir requests desde la URL del frontend

3. 📱 **Mobile**: TanStack Router genera SSR automático, funciona en dispositivos

4. 🐛 **Hot Module Replacement**: Vite recarga automático si cambias:
   - authContext.tsx
   - routeGuards.ts
   - login.tsx
   - Cualquier ruta

---

## Soporte

Si hay problemas:
1. Revisar AUTHENTICATION.md en la raíz del proyecto
2. Verificar que backend está corriendo
3. Abrir DevTools → Console para ver errores
4. Verificar localStorage en DevTools → Application
