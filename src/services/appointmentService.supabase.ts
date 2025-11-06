import type { Appointment } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { professionals, sessionTypes, machines } from "@/lib/data";
import { getClients } from "./clientService.supabase";
import { notifyPendingRecord } from "./notificationService";

// Convertir appointment de Supabase a formato de la app
const mapSupabaseToAppointment = async (row: any): Promise<Appointment | null> => {
  try {
    // Obtener el cliente
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', row.client_id)
      .single();

    if (clientError || !clientData) {
      console.error('Error fetching client for appointment:', clientError);
      return null;
    }

    const client = {
      id: clientData.id,
      name: clientData.name,
      isFirstTime: clientData.is_first_time,
      consents: clientData.consents || {}
    };

    const professional = professionals.find(p => p.id === row.professional_id);
    const sessionType = sessionTypes.find(s => s.id === row.session_type_id);
    
    // Manejar máquinas: puede ser un array JSONB o un solo machine_id (compatibilidad hacia atrás)
    let machinesArray: any[] = [];
    if (row.machine_ids && Array.isArray(row.machine_ids)) {
      machinesArray = row.machine_ids.map((id: string) => machines.find(m => m.id === id)).filter(Boolean);
    } else if (row.machine_id) {
      // Compatibilidad hacia atrás: si existe machine_id, lo convertimos a array
      const machine = machines.find(m => m.id === row.machine_id);
      if (machine) machinesArray = [machine];
    }

    if (!professional || !sessionType) {
      console.error('Invalid professional or session type');
      return null;
    }

    return {
      id: row.id,
      client,
      professional,
      sessionType,
      startTime: new Date(row.start_time),
      zone: row.zone as 'Dins' | 'Fora',
      camilla: row.camilla,
      machines: machinesArray.length > 0 ? machinesArray : undefined,
      notes: row.notes || '',
      isMutua: row.is_mutua,
      isFirstTimeAppointment: row.is_first_time_appointment
    };
  } catch (error) {
    console.error('Error mapping appointment:', error);
    return null;
  }
};

// Convertir appointment de la app a formato Supabase
const mapAppointmentToSupabase = (appointment: any) => ({
  client_id: appointment.client.id,
  session_type_id: appointment.sessionType.id,
  professional_id: appointment.professional.id,
  start_time: appointment.startTime.toISOString(),
  zone: appointment.zone,
  camilla: appointment.camilla,
  machine_ids: appointment.machines && appointment.machines.length > 0 
    ? appointment.machines.map((m: any) => m.id) 
    : null,
  notes: appointment.notes || '',
  is_mutua: appointment.isMutua || false,
  is_first_time_appointment: appointment.isFirstTimeAppointment || false
});

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }

    if (!data) return [];

    const appointments = await Promise.all(
      data.map(row => mapSupabaseToAppointment(row))
    );

    return appointments.filter((app): app is Appointment => app !== null);
  } catch (error) {
    console.error('Error in getAppointments:', error);
    return [];
  }
}

export async function addAppointment(
  appointmentData: Omit<Appointment, 'id' | 'startTime'> & { startTime: Date }
): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([mapAppointmentToSupabase(appointmentData)])
      .select()
      .single();

    if (error) {
      console.error('Error adding appointment:', error);
      return null;
    }

    const appointment = data ? await mapSupabaseToAppointment(data) : null;

    // Enviar notificación a la app de fichas SOLO si es cliente nuevo
    if (appointment) {
      console.log('📅 [APPOINTMENT] Appointment created successfully');
      console.log('📅 [APPOINTMENT] Client name:', appointment.client.name);
      console.log('📅 [APPOINTMENT] Client isFirstTime:', appointment.client.isFirstTime);
      console.log('📅 [APPOINTMENT] isFirstTimeAppointment:', appointment.isFirstTimeAppointment);
      
      // Solo enviar notificación si el cliente es nuevo (no tiene ficha)
      const isNewClient = appointment.client.isFirstTime || appointment.isFirstTimeAppointment;
      
      if (isNewClient) {
        console.log('🆕 [APPOINTMENT] New client detected, sending notification...');
        console.log('📅 [APPOINTMENT] Appointment ID:', appointment.id);
        console.log('📅 [APPOINTMENT] Start time:', appointment.startTime.toISOString());
        
        // Ejecutar la notificación y esperar el resultado
        try {
          const notificationSent = await notifyPendingRecord({
            clientName: appointment.client.name,
            appointmentId: appointment.id,
            appointmentDate: appointment.startTime.toISOString(),
          });
          
          if (notificationSent) {
            console.log('✅ [APPOINTMENT] Notification sent successfully for new client');
          } else {
            console.error('⚠️ [APPOINTMENT] Notification failed but appointment was created');
          }
        } catch (err) {
          console.error('❌ [APPOINTMENT] Error sending notification:', err);
          console.error('⚠️ [APPOINTMENT] Appointment was created but notification failed');
        }
      } else {
        console.log('ℹ️ [APPOINTMENT] Existing client - no notification needed');
      }
    }

    return appointment;
  } catch (error) {
    console.error('Error in addAppointment:', error);
    return null;
  }
}

export async function updateAppointment(
  appointmentId: string,
  appointmentData: Partial<Appointment & { professionalId?: string }>
): Promise<boolean> {
  try {
    const updateData: any = {};

    if (appointmentData.professionalId) {
      updateData.professional_id = appointmentData.professionalId;
    }
    if (appointmentData.notes !== undefined) {
      updateData.notes = appointmentData.notes;
    }
    if (appointmentData.zone) {
      updateData.zone = appointmentData.zone;
    }
    if (appointmentData.camilla) {
      updateData.camilla = appointmentData.camilla;
    }
    if (appointmentData.startTime) {
      updateData.start_time = appointmentData.startTime.toISOString();
    }
    if (appointmentData.machines !== undefined) {
      updateData.machine_ids = appointmentData.machines && appointmentData.machines.length > 0
        ? appointmentData.machines.map(m => m.id)
        : null;
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    return false;
  }
}

export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    return false;
  }
}
