# Sistema de Autenticación - FisioActiva

## Configuración

El sistema de autenticación está implementado usando NextAuth.js v5 con autenticación basada en credenciales.

### Credenciales de Acceso

- **Usuario**: `adminfisioactiva`
- **Contraseña**: `Fisioprocevia#2025`

## Características de Seguridad

1. **Autenticación JWT**: Las sesiones se manejan con tokens JWT seguros
2. **Middleware de Protección**: Todas las rutas están protegidas excepto `/login` y `/api/auth/*`
3. **Sesiones Persistentes**: Las sesiones duran 24 horas
4. **Logout Automático**: Redirección automática al login al cerrar sesión
5. **Protección de Rutas**: Middleware que verifica la autenticación en cada solicitud

## Estructura de Archivos

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # API de NextAuth
│   └── login/page.tsx                   # Página de login
├── components/
│   ├── auth-guard.tsx                   # Componente de protección
│   ├── providers.tsx                    # Provider de sesión
│   └── header.tsx                       # Header con logout
├── lib/
│   └── auth.ts                          # Configuración de NextAuth
├── middleware.ts                        # Middleware de protección
└── types/
    └── next-auth.d.ts                   # Tipos de TypeScript
```

## Uso

### Página de Login

La página de login está disponible en `/login` y incluye:
- Formulario de autenticación con validación
- Mensajes de error informativos
- Interfaz responsive y moderna
- Integración con el diseño del sistema

### Protección de Componentes

Para proteger cualquier componente, envuélvelo con `AuthGuard`:

```tsx
import { AuthGuard } from "@/components/auth-guard"

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourComponent />
    </AuthGuard>
  )
}
```

### Verificar Autenticación en Componentes

```tsx
import { useSession } from "next-auth/react"

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Cargando...</p>
  if (!session) return <p>No autenticado</p>
  
  return <p>Bienvenido {session.user?.name}</p>
}
```

### Logout

El botón de logout está disponible en el header de la aplicación.

## Variables de Entorno

Para producción, configura las siguientes variables de entorno:

```env
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-clave-secreta-muy-segura
```

## Seguridad Adicional

1. **Cambiar Credenciales**: Para cambiar las credenciales, edita el archivo `src/lib/auth.ts`
2. **Clave Secreta**: Cambia `NEXTAUTH_SECRET` en producción
3. **HTTPS**: Usa HTTPS en producción
4. **Rate Limiting**: Considera añadir rate limiting para el endpoint de login

## Desarrollo

Para ejecutar en modo desarrollo:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:9002`

## Notas de Implementación

- Las credenciales están hardcodeadas para simplicidad en desarrollo
- En producción, considera usar una base de datos para las credenciales
- El sistema está configurado para una sola cuenta de administrador
- Las sesiones se mantienen durante 24 horas por defecto
