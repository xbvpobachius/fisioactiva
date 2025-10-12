/**
 * Script de migración de localStorage a Supabase
 * Ejecuta esto una vez para migrar tus datos existentes
 */

import { supabase } from './supabase';

export async function migrateLocalStorageToSupabase() {
  if (typeof window === 'undefined') {
    console.error('Este script solo se puede ejecutar en el navegador');
    return;
  }

  console.log('🚀 Iniciando migración de localStorage a Supabase...');

  try {
    // 1. Migrar clientes
    const clientsJson = localStorage.getItem('clients');
    if (clientsJson) {
      const clients = JSON.parse(clientsJson);
      console.log(`📦 Encontrados ${clients.length} clientes en localStorage`);

      for (const client of clients) {
        const { data, error } = await supabase
          .from('clients')
          .insert([{
            id: client.id,
            name: client.name,
            is_first_time: client.isFirstTime,
            consents: client.consents || {}
          }])
          .select();

        if (error) {
          console.error(`❌ Error al migrar cliente ${client.name}:`, error);
        } else {
          console.log(`✅ Cliente migrado: ${client.name}`);
        }
      }
    }

    // 2. Migrar citas
    const appointmentsJson = localStorage.getItem('appointments');
    if (appointmentsJson) {
      const appointments = JSON.parse(appointmentsJson);
      console.log(`📦 Encontradas ${appointments.length} citas en localStorage`);

      for (const appointment of appointments) {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            id: appointment.id,
            client_id: appointment.client.id,
            session_type_id: appointment.sessionType.id,
            professional_id: appointment.professional.id,
            start_time: new Date(appointment.startTime).toISOString(),
            zone: appointment.zone,
            camilla: appointment.camilla,
            machine_id: appointment.machine?.id || null,
            notes: appointment.notes || '',
            is_mutua: appointment.isMutua || false,
            is_first_time_appointment: appointment.isFirstTimeAppointment || false
          }])
          .select();

        if (error) {
          console.error(`❌ Error al migrar cita:`, error);
        } else {
          console.log(`✅ Cita migrada: ${appointment.client.name} - ${new Date(appointment.startTime).toLocaleString()}`);
        }
      }
    }

    console.log('🎉 ¡Migración completada!');
    console.log('💡 Consejo: Verifica los datos en Supabase antes de borrar localStorage');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
  }
}

// Función para verificar que los datos se migraron correctamente
export async function verifyMigration() {
  try {
    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Resumen de migración:`);
    console.log(`   - Clientes en Supabase: ${clientsCount}`);
    console.log(`   - Citas en Supabase: ${appointmentsCount}`);

    const localClients = localStorage.getItem('clients');
    const localAppointments = localStorage.getItem('appointments');
    
    if (localClients) {
      const localClientsCount = JSON.parse(localClients).length;
      console.log(`   - Clientes en localStorage: ${localClientsCount}`);
    }
    
    if (localAppointments) {
      const localAppointmentsCount = JSON.parse(localAppointments).length;
      console.log(`   - Citas en localStorage: ${localAppointmentsCount}`);
    }

  } catch (error) {
    console.error('Error al verificar migración:', error);
  }
}

// Para usar en la consola del navegador:
// import { migrateLocalStorageToSupabase, verifyMigration } from '@/lib/migrate-to-supabase'
// await migrateLocalStorageToSupabase()
// await verifyMigration()
