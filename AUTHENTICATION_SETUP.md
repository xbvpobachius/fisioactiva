# Configuración de Autenticación - FisioActiva

## Problema Solucionado

El error "NO_SECRET" de NextAuth.js ha sido solucionado configurando directamente la clave secreta en el código.

## Credenciales de Acceso

- **Usuario**: `adminfisioactiva`
- **Contraseña**: `Fisioprocevia#2025`

## Cómo Acceder

1. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Abre tu navegador** y ve a:
   ```
   http://localhost:9002
   ```

3. **Serás redirigido automáticamente** a la página de login

4. **Introduce las credenciales**:
   - Usuario: `adminfisioactiva`
   - Contraseña: `Fisioprocevia#2025`

5. **¡Listo!** Tendrás acceso completo al sistema

## Características del Sistema

✅ **Autenticación segura** con NextAuth.js  
✅ **Protección de rutas** - todas las páginas requieren login  
✅ **Sesiones persistentes** - 24 horas de duración  
✅ **Logout seguro** - botón en el header  
✅ **Interfaz moderna** - diseño responsive  
✅ **Mensajes de error** informativos  

## Estructura de Seguridad

- **Middleware de protección**: Verifica autenticación en cada solicitud
- **JWT Tokens**: Sesiones seguras con tokens
- **Redirección automática**: Usuarios no autenticados van a `/login`
- **Logout automático**: Limpia la sesión al cerrar sesión

## Solución de Problemas

Si encuentras algún problema:

1. **Reinicia el servidor**:
   ```bash
   # Detener servidor (Ctrl+C)
   npm run dev
   ```

2. **Verifica que no hay errores** en la consola del navegador

3. **Limpia la caché** del navegador si es necesario

## Para Producción

Cuando despliegues en producción:

1. **Cambia la clave secreta** en `src/lib/auth.ts`
2. **Configura HTTPS**
3. **Usa variables de entorno** para la configuración
4. **Considera usar una base de datos** para las credenciales

El sistema está completamente funcional y listo para usar.
