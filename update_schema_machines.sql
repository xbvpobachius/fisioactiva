-- Script para actualizar el esquema de la base de datos para soportar múltiples máquinas
-- Ejecuta este script en el SQL Editor de Supabase

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

-- Opcional: Mantener machine_id por compatibilidad temporal, pero puedes eliminarlo después de verificar
-- ALTER TABLE appointments DROP COLUMN machine_id;

-- Crear índice para búsquedas eficientes en machine_ids
CREATE INDEX IF NOT EXISTS idx_appointments_machine_ids ON appointments USING GIN (machine_ids);

