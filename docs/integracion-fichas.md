# Integración Automática con App de Fichas

## Descripción

Esta integración permite que cuando se crea una nueva cita en **Fisioactiva**, automáticamente se envíe una notificación a la aplicación de **Fisiodbfiches** para recordar al fisioterapeuta que debe crear la ficha del cliente.

## Flujo de funcionamiento

1. **Usuario crea una cita en Fisioactiva** → Se guarda en la base de datos
2. **Sistema envía notificación automática** → Llama a la API de Fisiodbfiches
3. **Aparece en la lista de pendientes** → El fisioterapeuta ve la notificación
4. **Fisioterapeuta crea la ficha** → Se marca como completada automáticamente

## Configuración

### 1. En Fisiodbfiches (Railway)

Asegúrate de que el proyecto esté desplegado en Railway con las variables de entorno configuradas:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
GOOGLE_GENAI_API_KEY=tu_google_api_key
PORT=3000
```

Obtén tu **URL de Railway**, por ejemplo: `https://fisioactivafitxes.up.railway.app`

### 2. En Fisioactiva (Esta app)

#### Desarrollo local:

Crea o edita tu archivo `.env.local`:

```bash
NEXT_PUBLIC_FICHES_APP_URL=http://localhost:3000
```

#### Producción (Railway/Vercel/etc):

En las variables de entorno de producción, configura:

```bash
NEXT_PUBLIC_FICHES_APP_URL=https://fisioactivafitxes.up.railway.app
```

**Nota:** Reemplaza con tu URL real de Railway.

## Cómo probar

### Prueba local:

1. Inicia Fisiodbfiches:
   ```bash
   cd fisiodbfiches
   npm run dev
   ```

2. Inicia Fisioactiva (en otra terminal):
   ```bash
   cd fisioactiva-main
   npm run dev
   ```

3. Crea una cita en Fisioactiva

4. Ve a Fisiodbfiches → Deberías ver la notificación en la página principal

### Prueba en producción:

1. Despliega Fisiodbfiches en Railway
2. Configura `NEXT_PUBLIC_FICHES_APP_URL` en Fisioactiva con la URL de Railway
3. Crea una cita
4. La notificación aparecerá automáticamente

## Deshabilitar las notificaciones

Si quieres deshabilitar temporalmente las notificaciones automáticas:

- **Elimina** o **deja vacía** la variable `NEXT_PUBLIC_FICHES_APP_URL`
- Las citas se seguirán creando normalmente, solo no se enviarán notificaciones

## Logs y debugging

Los logs de notificaciones aparecen en la consola:

✅ **Éxito:**
```
Notification sent successfully: { success: true, record: {...} }
```

⚠️ **Sin configurar:**
```
FICHES_APP_URL not configured. Skipping notification.
```

❌ **Error:**
```
Error calling fiches app API: [detalles del error]
```

## API Endpoint utilizado

```
POST https://tu-dominio.railway.app/api/pending-records

Body:
{
  "clientName": "Nombre del Cliente",
  "appointmentId": "uuid-de-la-cita",
  "appointmentDate": "2025-10-25T10:30:00Z"
}
```

## Archivos modificados

- `src/services/notificationService.ts` - Servicio de notificaciones
- `src/services/appointmentService.supabase.ts` - Integración en creación de citas
- `env.example` - Documentación de variable de entorno

## Solución de problemas

### Las notificaciones no llegan:

1. Verifica que `NEXT_PUBLIC_FICHES_APP_URL` esté configurada correctamente
2. Verifica que Fisiodbfiches esté accesible desde internet (Railway)
3. Revisa los logs de la consola para ver errores
4. Verifica que las variables de entorno de Supabase estén correctas en Fisiodbfiches

### Error de CORS:

Si ves errores de CORS, asegúrate de que Fisiodbfiches esté desplegado correctamente en Railway y sea accesible públicamente.

### Las notificaciones se envían pero no aparecen:

1. Verifica que las credenciales de Supabase en Fisiodbfiches sean correctas
2. Verifica que la tabla `pending_records` exista en Supabase
3. Revisa los logs de Railway de Fisiodbfiches

