import type { Client } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// Convertir cliente de Supabase a formato de la app
const mapSupabaseToClient = (row: any): Client => ({
  id: row.id,
  name: row.name,
  isFirstTime: row.is_first_time,
  consents: row.consents || {}
});

// Convertir cliente de la app a formato Supabase
const mapClientToSupabase = (client: Partial<Client>) => ({
  name: client.name,
  is_first_time: client.isFirstTime,
  consents: client.consents || {}
});

export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }

    return data ? data.map(mapSupabaseToClient) : [];
  } catch (error) {
    console.error('Error in getClients:', error);
    return [];
  }
}

export async function addClient(clientData: Omit<Client, 'id'>): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([mapClientToSupabase(clientData)])
      .select()
      .single();

    if (error) {
      console.error('Error adding client:', error);
      return null;
    }

    return data ? mapSupabaseToClient(data) : null;
  } catch (error) {
    console.error('Error in addClient:', error);
    return null;
  }
}

export async function updateClient(clientId: string, clientData: Partial<Client>): Promise<boolean> {
  try {
    const updateData: any = {};
    
    if (clientData.name !== undefined) updateData.name = clientData.name;
    if (clientData.isFirstTime !== undefined) updateData.is_first_time = clientData.isFirstTime;
    if (clientData.consents !== undefined) updateData.consents = clientData.consents;

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId);

    if (error) {
      console.error('Error updating client:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateClient:', error);
    return false;
  }
}

export async function deleteClient(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteClient:', error);
    return false;
  }
}
