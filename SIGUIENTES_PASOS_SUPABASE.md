# ✅ Credenciales de Supabase Configuradas

## 🎯 Próximos Pasos

### 1. ⚡ Crear las Tablas en Supabase

**IMPORTANTE: Haz esto AHORA antes de iniciar la aplicación**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/txkytuhmjmoxnvxlhzsj
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **"New query"**
4. Copia y pega TODO el contenido del archivo `supabase_schema.sql`
5. Haz clic en **"Run"** (o presiona Ctrl+Enter)
6. Deberías ver: ✅ **"Success. No rows returned"**

### 2. 🔄 Actualizar los Imports (YA HECHO)

Ya he configurado la aplicación para usar Supabase. Los cambios están listos.

### 3. 🚀 Iniciar la Aplicación

```bash
npm run dev
```

### 4. 🧪 Probar que Funciona

1. Abre http://localhost:9002
2. Inicia sesión con: `adminfisioactiva` / `Fisioprocevia#2025`
3. **Crea un nuevo cliente** (ejemplo: "Test Supabase")
4. Ve a Supabase → **Table Editor** → tabla `clients`
5. ¡Deberías ver el cliente que acabas de crear!

### 5. 📊 Verificar las Tablas

En Supabase → **Table Editor** deberías ver:

**Tabla `clients`:**
- id (uuid)
- name (text)
- is_first_time (boolean)
- consents (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

**Tabla `appointments`:**
- id (uuid)
- client_id (uuid)
- session_type_id (text)
- professional_id (text)
- start_time (timestamp)
- zone (text)
- camilla (integer)
- machine_id (text)
- notes (text)
- is_mutua (boolean)
- is_first_time_appointment (boolean)
- created_at (timestamp)
- updated_at (timestamp)

## 🔍 Solución de Problemas

### Si ves errores al crear clientes/citas:

1. **Verifica que ejecutaste el SQL** en Supabase
2. **Revisa la consola** del navegador (F12 → Console)
3. **Verifica las tablas** en Supabase → Table Editor
4. **Revisa los logs** en Supabase → Logs

### Error: "relation clients does not exist"

→ No ejecutaste el archivo `supabase_schema.sql`. Ve al paso 1.

### Error: "Failed to fetch"

→ Verifica que la URL y la KEY de Supabase sean correctas en `.env`

## 📦 Migrar Datos Antiguos (Opcional)

Si ya tenías datos en localStorage y quieres migrarlos:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Pega este código:

```javascript
// Ver datos actuales en localStorage
const clients = JSON.parse(localStorage.getItem('clients') || '[]');
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
console.log('Clientes:', clients.length);
console.log('Citas:', appointments.length);
```

Si tienes datos que quieres migrar, avísame y te ayudo.

## 🎉 ¡Listo!

Una vez completados los pasos 1-4, tu aplicación estará usando Supabase y los datos se guardarán de forma permanente.

## 🌐 Para Railway

Cuando despliegues en Railway, añade estas mismas variables:
- `NEXT_PUBLIC_SUPABASE_URL=https://txkytuhmjmoxnvxlhzsj.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4a3l0dWhtam1veG52eGxoenNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTYxMzAsImV4cCI6MjA3NTc5MjEzMH0.PskS1WP0L4zyCykyXKpCebD2M8pzo1F2iywu_yDRGY4`
