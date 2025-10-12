import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Supabase tables
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          is_first_time: boolean
          consents: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_first_time?: boolean
          consents?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_first_time?: boolean
          consents?: any
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          session_type_id: string
          professional_id: string
          start_time: string
          zone: string
          camilla: number
          machine_id: string | null
          notes: string
          is_mutua: boolean
          is_first_time_appointment: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          session_type_id: string
          professional_id: string
          start_time: string
          zone: string
          camilla: number
          machine_id?: string | null
          notes?: string
          is_mutua?: boolean
          is_first_time_appointment?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          session_type_id?: string
          professional_id?: string
          start_time?: string
          zone?: string
          camilla?: number
          machine_id?: string | null
          notes?: string
          is_mutua?: boolean
          is_first_time_appointment?: boolean
          updated_at?: string
        }
      }
    }
  }
}
