
import type { Client } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
import { clients as initialClients } from "@/lib/data";

// Helper function to get clients from localStorage
const getClientsFromStorage = (): Client[] => {
  if (typeof window === 'undefined') {
    return initialClients;
  }
  try {
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      return JSON.parse(storedClients);
    } else {
      // Initialize localStorage with initial data
      localStorage.setItem('clients', JSON.stringify(initialClients));
      return initialClients;
    }
  } catch (error) {
    console.error("Failed to read clients from localStorage", error);
    return initialClients;
  }
};

// Helper function to save clients to localStorage
const saveClientsToStorage = (clients: Client[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('clients', JSON.stringify(clients));
  } catch (error)
 {
    console.error("Failed to save clients to localStorage", error);
  }
};

// In-memory store for clients, now sourced from localStorage
let clients: Client[] = [];
if (typeof window !== 'undefined') {
    clients = getClientsFromStorage();
}


export async function getClients(): Promise<Client[]> {
  clients = getClientsFromStorage();
  return Promise.resolve([...clients]);
}

export async function addClient(clientData: Omit<Client, 'id'>): Promise<Client | null> {
  const newClient: Client = {
    id: uuidv4(),
    ...clientData
  };
  clients.push(newClient);
  saveClientsToStorage(clients);
  return Promise.resolve(newClient);
}

export async function updateClient(clientId: string, clientData: Partial<Client>): Promise<boolean> {
  clients = getClientsFromStorage(); // Always get the freshest data
  const index = clients.findIndex(c => c.id === clientId);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...clientData };
    saveClientsToStorage(clients);
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

export async function deleteClient(clientId: string): Promise<boolean> {
  clients = getClientsFromStorage(); // Always get the freshest data
  const initialLength = clients.length;
  clients = clients.filter(c => c.id !== clientId);
  const success = clients.length < initialLength;
  if (success) {
    saveClientsToStorage(clients);
  }
  return Promise.resolve(success);
}
