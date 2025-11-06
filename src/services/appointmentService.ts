
import type { Appointment } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { initialAppointments, professionals, sessionTypes, machines } from "@/lib/data";
import { getClients } from "./clientService";

// Helper function to get appointments from localStorage
const getAppointmentsFromStorage = (): Appointment[] => {
  if (typeof window === 'undefined') {
    return initialAppointments;
  }
  try {
    const storedAppointments = localStorage.getItem('appointments');
    const clients = getClientsFromStorage(); // Use the same source of truth for clients
    if (storedAppointments) {
      // Need to parse and re-hydrate Date objects and relations
      const parsed = JSON.parse(storedAppointments);
      return parsed.map((app: any) => ({
        ...app,
        startTime: new Date(app.startTime),
        client: clients.find(c => c.id === app.client.id) || app.client,
        professional: professionals.find(p => p.id === app.professional.id) || app.professional,
        sessionType: sessionTypes.find(s => s.id === app.sessionType.id) || app.sessionType,
        machines: app.machines 
          ? app.machines.map((m: any) => machines.find(m2 => m2.id === m.id) || m).filter(Boolean)
          : app.machine 
            ? [machines.find(m => m.id === app.machine.id) || app.machine].filter(Boolean)
            : undefined,
      }));
    } else {
      // Initialize localStorage with initial data
      localStorage.setItem('appointments', JSON.stringify(initialAppointments));
      return initialAppointments;
    }
  } catch (error) {
    console.error("Failed to read appointments from localStorage", error);
    return initialAppointments;
  }
};

// This is a helper function to get clients without creating a circular dependency issue in modules.
const getClientsFromStorage = () => {
   if (typeof window === 'undefined') return [];
   try {
    const storedClients = localStorage.getItem('clients');
    return storedClients ? JSON.parse(storedClients) : [];
   } catch (error) {
    console.error("Failed to read clients from localStorage for appointments", error);
    return [];
   }
}

// Helper function to save appointments to localStorage
const saveAppointmentsToStorage = (appointments: Appointment[]) => {
   if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  } catch (error) {
    console.error("Failed to save appointments to localStorage", error);
  }
};

// In-memory store for appointments, now sourced from localStorage
let appointments: Appointment[] = [];
if (typeof window !== 'undefined') {
    appointments = getAppointmentsFromStorage();
}


export async function getAppointments(): Promise<Appointment[]> {
  appointments = getAppointmentsFromStorage();
  return Promise.resolve([...appointments]);
}

export async function addAppointment(appointmentData: Omit<Appointment, 'id' | 'startTime'> & { startTime: Date }): Promise<Appointment | null> {
  const newAppointment: Appointment = {
    ...appointmentData,
    id: uuidv4(),
  };
  appointments.push(newAppointment);
  saveAppointmentsToStorage(appointments);
  return Promise.resolve(newAppointment);
}

export async function updateAppointment(appointmentId: string, appointmentData: Partial<Appointment & {professionalId?: string}>): Promise<boolean> {
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index !== -1) {
    if (appointmentData.professionalId) {
      const professional = professionals.find(p => p.id === appointmentData.professionalId);
      if (professional) {
        appointments[index].professional = professional;
      }
      delete appointmentData.professionalId;
    }
    
    // Update the client object within the appointment as well, in case it changed
    if (appointmentData.client) {
        const allClients = getClientsFromStorage();
        const updatedClient = allClients.find(c => c.id === appointmentData.client?.id);
        if (updatedClient) {
            appointments[index].client = updatedClient;
        }
    }

    appointments[index] = { ...appointments[index], ...appointmentData };
    saveAppointmentsToStorage(appointments);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export async function deleteAppointment(appointmentId: string): Promise<boolean> {
  const initialLength = appointments.length;
  appointments = appointments.filter(a => a.id !== appointmentId);
  const success = appointments.length < initialLength;
  if (success) {
    saveAppointmentsToStorage(appointments);
  }
  return Promise.resolve(success);
}
