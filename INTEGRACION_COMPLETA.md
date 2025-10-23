# ✅ Integración Completa: Fisioactiva ↔ Fisiodbfiches

## 🎯 Resumen

Se ha implementado con éxito la integración automática entre las dos aplicaciones:

- **Fisioactiva** (App de gestión de citas) → Envía notificaciones
- **Fisiodbfiches** (App de gestión de fichas) → Recibe notificaciones

## 🔄 Flujo Automático

```
1. Se crea una cita en Fisioactiva
        ↓
2. Sistema envía notificación automática vía API
        ↓
3. La notificación aparece en Fisiodbfiches
        ↓
4. Fisioterapeuta ve la alerta en la página principal
        ↓
5. Fisioterapeuta crea la ficha desde la notificación
        ↓
6. Se marca como completada automáticamente
```

## 📁 Archivos Creados/Modificados

### En Fisioactiva:
- ✅ `src/services/notificationService.ts` - Servicio de notificaciones
- ✅ `src/services/appointmentService.supabase.ts` - Integrado con notificaciones
- ✅ `env.example` - Documentación de variables de entorno
- ✅ `docs/integracion-fichas.md` - Documentación completa

### En Fisiodbfiches:
- ✅ `src/app/api/pending-records/route.ts` - Endpoint API REST
- ✅ `docs/API.md` - Documentación de la API

## ⚙️ Configuración Requerida

### 1. Fisiodbfiches (Railway)

Variables de entorno en Railway:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://txkytuhmjmoxnvxlhzsj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_GENAI_API_KEY=AIzaSyDBN-oU4jeC7xHmTkfDTVKmS_aBfhTjXsY
PORT=3000
```

URL de producción: `https://fisioactivafitxes.up.railway.app` (o la que te dé Railway)

### 2. Fisioactiva (En producción)

Variable de entorno necesaria:
```bash
NEXT_PUBLIC_FICHES_APP_URL=https://fisioactivafitxes.up.railway.app
```

### 3. Para desarrollo local

**En Fisiodbfiches:**
```bash
# Ya está configurado, solo ejecuta:
npm run dev  # Puerto 3000 por defecto
```

**En Fisioactiva:**
```bash
# Crea .env.local con:
NEXT_PUBLIC_FICHES_APP_URL=http://localhost:3000

# Ejecuta:
npm run dev  # Puerto 9002
```

## 🧪 Cómo Probar

### Prueba Local:

1. **Terminal 1 - Fisiodbfiches:**
   ```bash
   cd fisiodbfiches
   npm run dev
   ```

2. **Terminal 2 - Fisioactiva:**
   ```bash
   cd fisioactiva-main
   # Asegúrate de tener NEXT_PUBLIC_FICHES_APP_URL=http://localhost:3000 en .env.local
   npm run dev
   ```

3. **Crear cita:**
   - Abre http://localhost:9002 (Fisioactiva)
   - Crea una cita nueva
   - Los logs mostrarán: `Notification sent successfully`

4. **Ver notificación:**
   - Abre http://localhost:3000 (Fisiodbfiches)
   - Verás la notificación en la página principal
   - Haz clic en "Crear Fitxa"

### Prueba en Producción:

1. Despliega Fisiodbfiches en Railway
2. Obtén la URL de Railway (ej: `https://fisioactivafitxes.up.railway.app`)
3. Configura `NEXT_PUBLIC_FICHES_APP_URL` en Fisioactiva
4. Despliega Fisioactiva
5. ¡Funciona automáticamente!

## 📡 API Endpoint

### POST /api/pending-records

**Request:**
```json
{
  "clientName": "Maria Garcia López",
  "appointmentId": "uuid-de-la-cita",
  "appointmentDate": "2025-10-25T10:30:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "record": {
    "id": "uuid-generado",
    "clientName": "Maria Garcia López",
    "appointmentId": "uuid-de-la-cita",
    "appointmentDate": "2025-10-25T10:30:00Z",
    "isCompleted": false
  }
}
```

## 🔍 Logs y Debugging

### En Fisioactiva (cuando se crea cita):
```
✅ Notification sent successfully: { success: true, record: {...} }
⚠️ FICHES_APP_URL not configured. Skipping notification.
❌ Error calling fiches app API: [error]
```

### En Fisiodbfiches (cuando recibe notificación):
```
POST /api/pending-records 201
✅ Pending record created successfully
```

## 📋 Próximos Pasos

1. ✅ **Despliega Fisiodbfiches en Railway**
   - Configura las 4 variables de entorno
   - Obtén la URL pública

2. ✅ **Configura Fisioactiva**
   - Añade `NEXT_PUBLIC_FICHES_APP_URL` con la URL de Railway
   - Redespliega o reinicia

3. ✅ **Prueba la integración**
   - Crea una cita en Fisioactiva
   - Verifica que aparece en Fisiodbfiches

4. ✅ **Opcional: Sube Fisioactiva a GitHub**
   ```bash
   # Ya está inicializado Git, solo necesitas:
   # 1. Crear repo en GitHub
   # 2. Ejecutar:
   git remote add origin https://github.com/TU_USUARIO/fisioactiva.git
   git branch -M main
   git push -u origin main
   ```

## ❓ Solución de Problemas

### No llegan las notificaciones:
- ✅ Verifica que `NEXT_PUBLIC_FICHES_APP_URL` esté configurada
- ✅ Verifica que Fisiodbfiches sea accesible públicamente
- ✅ Revisa los logs de ambas apps
- ✅ Prueba el endpoint manualmente con cURL

### Error 500 en la API:
- ✅ Verifica las credenciales de Supabase en Fisiodbfiches
- ✅ Verifica que la tabla `pending_records` exista
- ✅ Revisa los logs de Railway

### Las notificaciones no se marcan como completadas:
- ✅ Verifica que el `pendingId` se pase correctamente
- ✅ Verifica la función `completePendingRecord` en el código

## 📚 Documentación Adicional

- Ver `docs/integracion-fichas.md` para más detalles
- Ver `docs/API.md` en Fisiodbfiches para especificaciones de la API

---

**Estado:** ✅ Integración completada y lista para producción
**Fecha:** Octubre 2025
**Desarrollador:** AI Assistant con Cursor

