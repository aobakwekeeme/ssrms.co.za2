import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  role: 'customer' | 'shop_owner' | 'government_official';
  business_name?: string;
  department?: string;
  jurisdiction?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpazaShop {
  id: string;
  owner_id: string;
  shop_name: string;
  business_registration_number?: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  email?: string;
  trading_hours?: Record<string, { open: string; close: string }>;
  product_categories?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  compliance_score: number;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ShopDocument {
  id: string;
  shop_id: string;
  document_type: 'business_registration' | 'tax_clearance' | 'health_certificate' | 'fire_certificate' | 'lease_agreement' | 'id_document';
  document_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiry_date?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  uploaded_at: string;
}

export interface ComplianceRecord {
  id: string;
  shop_id: string;
  category: 'business_registration' | 'health_safety' | 'tax_compliance';
  score: number;
  max_score: number;
  assessed_by: string;
  assessment_date: string;
  notes?: string;
  requirements_met?: string[];
  requirements_failed?: string[];
  next_assessment_due?: string;
  created_at: string;
}

export interface Inspection {
  id: string;
  shop_id: string;
  inspector_id: string;
  inspection_type: string;
  scheduled_date: string;
  actual_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  passed?: boolean;
  score?: number;
  findings?: string;
  recommendations?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  completed_at?: string;
}

export interface CustomerReview {
  id: string;
  shop_id: string;
  customer_id: string;
  rating: number;
  title?: string;
  comment?: string;
  service_rating?: number;
  product_quality_rating?: number;
  cleanliness_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  related_shop_id?: string;
  related_inspection_id?: string;
  is_read: boolean;
  created_at: string;
}