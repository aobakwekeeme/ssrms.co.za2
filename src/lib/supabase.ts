import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
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