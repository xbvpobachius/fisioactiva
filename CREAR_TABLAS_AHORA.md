# ⚠️ ACCIÓN REQUERIDA: Crear Tablas en Supabase

## 🚨 Los errores que ves son porque las tablas NO EXISTEN todavía

```
Error fetching clients: {}
Error fetching appointments: {}
Error adding client: {}
```

## ✅ Solución (5 minutos):

### Paso 1: Ir a Supabase
Ve a: https://supabase.com/dashboard/project/txkytuhmjmoxnvxlhzsj

### Paso 2: Abrir SQL Editor
En el menú lateral izquierdo, haz clic en:
```
📊 SQL Editor
```

### Paso 3: Nueva Consulta
Haz clic en el botón verde:
```
+ New query
```

### Paso 4: Copiar el SQL
Abre el archivo `supabase_schema.sql` que está en la raíz del proyecto.

**Copia TODO el contenido** (desde `-- Schema SQL` hasta el final)

### Paso 5: Pegar y Ejecutar
1. Pega el SQL en el editor de Supabase
2. Haz clic en el botón **"Run"** (verde, esquina inferior derecha)
3. O presiona `Ctrl + Enter` (Windows) o `Cmd + Enter` (Mac)

### Paso 6: Verificar el Éxito
Deberías ver este mensaje:
```
✅ Success. No rows returned
```

### Paso 7: Verificar las Tablas
1. En el menú lateral, haz clic en **"Table Editor"**
2. Deberías ver dos tablas:
   - ✅ `clients`
   - ✅ `appointments`

### Paso 8: Probar la Aplicación
1. Ve a: http://localhost:9002/test-supabase
2. Esta página te dirá si todo está configurado correctamente
3. Si todo está ✅, vuelve a la app principal

### Paso 9: Recargar la App
1. Ve a http://localhost:9002
2. Recarga la página (F5)
3. Los errores deberían desaparecer
4. ¡Prueba crear un cliente!

## 🔍 Verificación Visual

### En Supabase → Table Editor → clients deberías ver:

| Columna | Tipo |
|---------|------|
| id | uuid |
| name | text |
| is_first_time | bool |
| consents | jsonb |
| created_at | timestamptz |
| updated_at | timestamptz |

### En Supabase → Table Editor → appointments deberías ver:

| Columna | Tipo |
|---------|------|
| id | uuid |
| client_id | uuid |
| session_type_id | text |
| professional_id | text |
| start_time | timestamptz |
| zone | text |
| camilla | int4 |
| machine_id | text |
| notes | text |
| is_mutua | bool |
| is_first_time_appointment | bool |
| created_at | timestamptz |
| updated_at | timestamptz |

## 💡 Atajos Rápidos

**SQL Editor**: https://supabase.com/dashboard/project/txkytuhmjmoxnvxlhzsj/editor

**Table Editor**: https://supabase.com/dashboard/project/txkytuhmjmoxnvxlhzsj/editor

## ❓ Si algo sale mal

1. **Error: "relation already exists"**
   - ✅ ¡Perfecto! Ya las creaste antes. Recarga la app.

2. **Error: "syntax error"**
   - ❌ Copiaste mal el SQL. Asegúrate de copiar TODO el archivo.

3. **No veo las tablas**
   - Verifica que estés en el proyecto correcto
   - URL debe terminar en: `/txkytuhmjmoxnvxlhzsj`

## 🎯 Una vez hecho esto

La aplicación funcionará perfectamente y:
- ✅ Los clientes se guardarán en Supabase
- ✅ Las citas se guardarán en Supabase
- ✅ Los datos persistirán para siempre
- ✅ Funcionará en cualquier dispositivo
- ✅ No se perderán al borrar caché
