# 📋 Cómo Ver los Logs en Railway

## 🔍 Dónde están los logs

Los logs te muestran exactamente qué está pasando cuando creas una cita y si la notificación se envía correctamente.

### Paso 1: Ve a Railway Dashboard

1. Abre https://railway.app
2. Inicia sesión
3. Selecciona tu proyecto **Fisioactiva** (el de calendario/agenda)

### Paso 2: Accede a los Logs

Hay **2 formas** de ver los logs:

#### Opción A: Desde la vista principal del proyecto

1. En el dashboard, verás tu servicio de Fisioactiva
2. Haz clic en el **servicio/deployment**
3. Busca la pestaña **"Logs"** en la parte superior
4. Los logs aparecerán en tiempo real

#### Opción B: Desde Deployments

1. En el menú lateral, haz clic en **"Deployments"**
2. Haz clic en el deployment más reciente (el primero de la lista)
3. Verás una pantalla con los logs en tiempo real

### Paso 3: Busca los mensajes de notificación

Los logs tienen emojis para identificarlos fácilmente. Busca estos mensajes:

#### ✅ Si funciona correctamente:

```
📅 [APPOINTMENT] Appointment created successfully, sending notification...
📅 [APPOINTMENT] Client name: Maria Garcia
📅 [APPOINTMENT] Appointment ID: abc-123
📅 [APPOINTMENT] Start time: 2025-10-25T10:30:00.000Z
🔔 [NOTIFICATION] Starting notification process...
🔔 [NOTIFICATION] FICHES_API_URL (raw): https://tu-dominio.railway.app
🔔 [NOTIFICATION] FICHES_API_URL (clean): https://tu-dominio.railway.app
🔔 [NOTIFICATION] Notification data: { clientName: 'Maria Garcia', appointmentId: 'abc-123', appointmentDate: '...' }
🔔 [NOTIFICATION] Sending POST to: https://tu-dominio.railway.app/api/pending-records
🔔 [NOTIFICATION] Response status: 201
✅ [NOTIFICATION] Notification sent successfully!
✅ [NOTIFICATION] Result: { success: true, record: {...} }
✅ [APPOINTMENT] Notification sent successfully
```

#### ❌ Si la variable NO está configurada:

```
🔔 [NOTIFICATION] Starting notification process...
🔔 [NOTIFICATION] FICHES_API_URL (raw): undefined
❌ [NOTIFICATION] NEXT_PUBLIC_FICHES_APP_URL not configured!
❌ [NOTIFICATION] Please add NEXT_PUBLIC_FICHES_APP_URL to Railway environment variables
⚠️ [APPOINTMENT] Notification failed but appointment was created
```

**Solución:** Ve a Variables → Agrega `NEXT_PUBLIC_FICHES_APP_URL`

#### ❌ Si hay error de conexión:

```
🔔 [NOTIFICATION] Sending POST to: https://tu-dominio.railway.app/api/pending-records
❌ [NOTIFICATION] Error calling fiches app API: TypeError: fetch failed
❌ [NOTIFICATION] Error message: fetch failed
```

**Posibles causas:**
- La URL de Fisiodbfiches es incorrecta
- Fisiodbfiches no está desplegado o está caído
- Hay un problema de red

#### ❌ Si hay error 400/500 del API:

```
🔔 [NOTIFICATION] Response status: 400
❌ [NOTIFICATION] Error response: {"error":"Missing required fields",...}
```

**Solución:** Hay un problema en el API de Fisiodbfiches o en los datos enviados

## 🔧 Cómo hacer una prueba

### Paso 1: Abre los logs en tiempo real

1. Ve a Railway → Fisioactiva → Logs
2. Deja la pestaña abierta (los logs se actualizan en tiempo real)

### Paso 2: Crea una cita

1. Abre tu aplicación de Fisioactiva en producción
2. Crea una nueva cita
3. **Inmediatamente mira los logs** en Railway

### Paso 3: Busca los emojis

Usa Ctrl+F (o Cmd+F en Mac) para buscar:
- `🔔` - Mensajes de notificación
- `📅` - Mensajes de citas
- `✅` - Éxito
- `❌` - Error

## 📝 Checklist de debugging

- [ ] Puedo acceder a los logs de Railway
- [ ] Veo mensajes con emojis 🔔 📅
- [ ] Veo: `FICHES_API_URL (raw): https://...`
- [ ] La URL es correcta (coincide con Fisiodbfiches)
- [ ] Veo: `Response status: 201`
- [ ] Veo: `✅ Notification sent successfully`
- [ ] Verifico en Supabase que el registro se creó en `pending_records`
- [ ] Verifico en Fisiodbfiches que la notificación aparece

## 🆘 Si no ves los mensajes con emojis

Si después de crear una cita NO ves ningún mensaje con 🔔 o 📅:

1. **Verifica que el deploy se completó:**
   - Ve a Deployments
   - El último deployment debe estar en estado "Success"
   - Si dice "Building" o "Deploying", espera a que termine

2. **Verifica que estás mirando los logs correctos:**
   - Asegúrate de estar en el servicio de **Fisioactiva** (no Fisiodbfiches)
   - Los logs deben actualizarse en tiempo real

3. **Redeploy manualmente:**
   - Ve a Settings → Click en "Redeploy"
   - Espera a que termine
   - Prueba de nuevo

## 📞 Información útil para debugging

Cuando veas los logs, anota:

1. **¿Ves este mensaje?**
   ```
   🔔 [NOTIFICATION] FICHES_API_URL (raw): ...
   ```
   ¿Qué URL aparece? (debe ser la de Fisiodbfiches)

2. **¿Qué status code ves?**
   ```
   🔔 [NOTIFICATION] Response status: ???
   ```
   - 201 = Éxito ✅
   - 400 = Faltan datos ⚠️
   - 404 = URL incorrecta ❌
   - 500 = Error del servidor ❌

3. **¿Ves algún error?**
   Copia el mensaje completo que aparece después de ❌

---

## 🎯 Resumen rápido

1. **Railway → Fisioactiva → Logs**
2. **Crear una cita en producción**
3. **Buscar 🔔 en los logs**
4. **Verificar que dice: Response status: 201**
5. **Verificar que dice: ✅ Notification sent successfully**

Si ves todo esto ✅, entonces la notificación se envió correctamente y debería aparecer en Fisiodbfiches y en Supabase (`pending_records`).

