import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      contractors: {
        Row: {
          id: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          industry: string
          sub_service: string
          zip_codes: string[]
          sms_opt_in: boolean
          lead_credits: number
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_name: string
          contact_name: string
          email: string
          phone: string
          industry: string
          sub_service: string
          zip_codes: string[]
          sms_opt_in: boolean
          lead_credits?: number
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          contact_name?: string
          email?: string
          phone?: string
          industry?: string
          sub_service?: string
          zip_codes?: string[]
          sms_opt_in?: boolean
          lead_credits?: number
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          customer_name: string
          service_category: string
          sub_service: string
          zip_code: string
          phone: string
          description: string
          claimed: boolean
          claimed_by: string | null
          claimed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          service_category: string
          sub_service: string
          zip_code: string
          phone: string
          description: string
          claimed?: boolean
          claimed_by?: string | null
          claimed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          service_category?: string
          sub_service?: string
          zip_code?: string
          phone?: string
          description?: string
          claimed?: boolean
          claimed_by?: string | null
          claimed_at?: string | null
          created_at?: string
        }
      }
      claim_tokens: {
        Row: {
          id: string
          token: string
          lead_id: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          lead_id: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          lead_id?: string
          expires_at?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          contractor_id: string
          amount: number
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contractor_id: string
          amount: number
          source: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contractor_id?: string
          amount?: number
          source?: string
          notes?: string | null
          created_at?: string
        }
        transactions: {
          Row: {
            id: string
            contractor_id: string
            amount: number
            source: string
            notes: string | null
            created_at: string
          }
          Insert: {
            id?: string
            contractor_id: string
            amount: number
            source: string
            notes?: string | null
            created_at?: string
          }
          Update: {
            id?: string
            contractor_id?: string
            amount?: number
            source?: string
            notes?: string | null
            created_at?: string
          }
        }
      }
    }
  }
}
