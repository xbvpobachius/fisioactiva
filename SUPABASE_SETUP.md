# 🗄️ Configuración de Supabase para FisioActiva

## 📋 Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (es gratis)
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `fisioactiva` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a ti (Europe West recomendado)
4. Haz clic en **"Create new project"** y espera 1-2 minutos

## 🔑 Paso 2: Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (icono de engranaje en el menú lateral)
2. Haz clic en **API**
3. Copia estos dos valores:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: La clave pública (empieza con `eyJ...`)

## 📝 Paso 3: Configurar Variables de Entorno

### En local (archivo `.env`):

Añade estas líneas al archivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

### En Railway:

Ve a tu proyecto en Railway → Variables y añade:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🗃️ Paso 4: Crear las Tablas

1. En Supabase, ve a **SQL Editor** en el menú lateral
2. Haz clic en **"New query"**
3. Copia y pega el contenido del archivo `supabase_schema.sql`
4. Haz clic en **"Run"** (o presiona Ctrl+Enter)
5. Deberías ver el mensaje: **"Success. No rows returned"**

## ✅ Paso 5: Verificar las Tablas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver dos tablas:
   - `clients` - Para los clientes
   - `appointments` - Para las citas

## 🔄 Paso 6: Activar Supabase en el Código

Una vez tengas las variables de entorno configuradas:

### Opción A: Usar solo Supabase (recomendado)

Reemplaza los imports en los componentes:

**En `src/components/dashboard.tsx`:**
```typescript
// Cambia esta línea:
import { getAppointments, addAppointment, updateAppointment, deleteAppointment as deleteAppointmentService } from "@/services/appointmentService";

// Por esta:
import { getAppointments, addAppointment, updateAppointment, deleteAppointment as deleteAppointmentService } from "@/services/appointmentService.supabase";
```

**Y esta línea:**
```typescript
// Cambia:
import { getClients, updateClient } from "@/services/clientService";

// Por:
import { getClients, updateClient } from "@/services/clientService.supabase";
```

**En `src/components/quick-create-panel.tsx`:**
```typescript
// Cambia:
import { addClient, deleteClient as deleteClientService, updateClient } from "@/services/clientService";

// Por:
import { addClient, deleteClient as deleteClientService, updateClient } from "@/services/clientService.supabase";
```

**En `src/components/appointment-details-dialog.tsx`:**
```typescript
// Cambia:
import { updateClient } from "@/services/clientService";

// Por:
import { updateClient } from "@/services/clientService.supabase";
```

### Opción B: Migración gradual

Puedes mantener ambos sistemas funcionando temporalmente y migrar los datos manualmente desde localStorage a Supabase.

## 📊 Paso 7: Migrar Datos Existentes (Opcional)

Si ya tienes datos en localStorage que quieres migrar:

1. Abre las DevTools (F12) en tu aplicación
2. Ve a **Console**
3. Ejecuta este script para exportar los datos:

```javascript
// Exportar clientes
const clients = JSON.parse(localStorage.getItem('clients') || '[]');
console.log('Clientes:', JSON.stringify(clients, null, 2));

// Exportar citas
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log('Citas:', JSON.stringify(appointments, null, 2));
```

4. Copia los datos y guárdalos en archivos JSON
5. Usa el SQL Editor de Supabase para insertar los datos manualmente

## 🧪 Paso 8: Probar la Conexión

1. Reinicia el servidor de desarrollo
2. Abre la aplicación
3. Intenta crear un nuevo cliente
4. Ve a Supabase → Table Editor → clients
5. Deberías ver el nuevo cliente en la tabla

## 🎯 Ventajas de Usar Supabase

✅ **Datos persistentes** - No se pierden al borrar la caché  
✅ **Sincronización** - Acceso desde cualquier dispositivo  
✅ **Backup automático** - Supabase hace copias de seguridad  
✅ **Escalable** - Soporta miles de registros sin problemas  
✅ **Real-time** - Puedes añadir actualizaciones en tiempo real  
✅ **Gratis** - 500MB de base de datos y 2GB de almacenamiento

## 🔒 Seguridad

Las políticas RLS (Row Level Security) están configuradas para permitir todo el acceso por ahora. En producción, considera:

1. **Añadir autenticación de Supabase** vinculada a NextAuth
2. **Configurar políticas RLS** más restrictivas
3. **Usar Service Role Key** para operaciones del servidor

## 📞 Soporte

Si tienes problemas:

1. Verifica que las variables de entorno estén correctas
2. Revisa la consola del navegador para ver errores
3. Consulta los logs en Supabase → Logs
4. Verifica que las tablas se crearon correctamente

## 🚀 ¡Listo para Producción!

Una vez configurado, Supabase funciona igual en local y en producción. Solo necesitas añadir las mismas variables de entorno en Railway.
