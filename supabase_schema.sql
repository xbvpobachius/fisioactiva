-- Schema SQL para Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_first_time BOOLEAN DEFAULT true,
  consents JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Citas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_type_id TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('Dins', 'Fora')),
  camilla INTEGER NOT NULL CHECK (camilla BETWEEN 1 AND 4),
  machine_id TEXT,
  notes TEXT DEFAULT '',
  is_mutua BOOLEAN DEFAULT false,
  is_first_time_appointment BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir todo por ahora, puedes ajustar según necesites)
CREATE POLICY "Enable all access for clients" ON clients
  FOR ALL USING (true);

CREATE POLICY "Enable all access for appointments" ON appointments
  FOR ALL USING (true);

-- Comentarios para documentación
COMMENT ON TABLE clients IS 'Tabla de clientes de FisioActiva';
COMMENT ON TABLE appointments IS 'Tabla de citas/appointments de FisioActiva';
COMMENT ON COLUMN clients.is_first_time IS 'Indica si es la primera vez del cliente (requiere firma de consentimiento)';
COMMENT ON COLUMN clients.consents IS 'JSON con los consentimientos firmados por el cliente';
COMMENT ON COLUMN appointments.is_first_time_appointment IS 'Indica si esta cita es la primera visita del cliente';
