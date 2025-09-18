import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only throw error if both are still placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co' && supabaseAnonKey === 'placeholder-key') {
  console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: 'customer' | 'shop-owner' | 'government'
          phone: string
          address: string
          business_name: string | null
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'customer' | 'shop-owner' | 'government'
          phone: string
          address: string
          business_name?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'customer' | 'shop-owner' | 'government'
          phone?: string
          address?: string
          business_name?: string | null
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          phone: string
          email: string
          business_registration_number: string | null
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          compliance_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address: string
          phone: string
          email: string
          business_registration_number?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          compliance_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          business_registration_number?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          compliance_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          shop_id: string
          customer_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          customer_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          customer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}