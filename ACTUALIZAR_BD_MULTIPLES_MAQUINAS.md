# IMPORTANTE: Actualizar Base de Datos para Múltiples Máquinas

Para que las reservas guarden y muestren **todas las máquinas seleccionadas**, necesitas ejecutar el siguiente script SQL en Supabase:

## Pasos:

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta el siguiente script:

```sql
-- Agregar columna machine_ids como JSONB (array de IDs de máquinas)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS machine_ids JSONB;

-- Migrar datos existentes de machine_id a machine_ids
UPDATE appointments 
SET machine_ids = CASE 
  WHEN machine_id IS NOT NULL THEN jsonb_build_array(machine_id)
  ELSE NULL
END
WHERE machine_ids IS NULL;

-- Crear índice para búsquedas eficientes en machine_ids
CREATE INDEX IF NOT EXISTS idx_appointments_machine_ids ON appointments USING GIN (machine_ids);
```

4. Verifica que el campo se haya creado correctamente ejecutando:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('machine_id', 'machine_ids');
```

## ¿Qué hace este script?

- **Agrega el campo `machine_ids`** como JSONB para almacenar arrays de máquinas
- **Migra los datos existentes** de `machine_id` a `machine_ids` (manteniendo compatibilidad)
- **Crea un índice** para mejorar el rendimiento de las búsquedas

## Nota

El código ya está preparado para funcionar con ambos campos (`machine_id` y `machine_ids`), pero **sin el campo `machine_ids` solo se guardará la primera máquina seleccionada** como medida de compatibilidad.

Después de ejecutar el script, todas las máquinas seleccionadas se guardarán y mostrarán correctamente.

