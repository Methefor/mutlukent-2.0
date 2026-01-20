export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          display_name: string
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          permissions?: Json
          created_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          code: string
          season: 'summer' | 'winter' | 'all_year'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          season: 'summer' | 'winter' | 'all_year'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          season?: 'summer' | 'winter' | 'all_year'
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          role_id: string | null
          branch_id: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role_id?: string | null
          branch_id?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role_id?: string | null
          branch_id?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          branch_id: string
          created_by: string
          report_date: string
          cash_sales: number
          credit_card_sales: number
          debit_card_sales: number
          total_sales: number
          notes: string | null
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          created_by: string
          report_date: string
          cash_sales?: number
          credit_card_sales?: number
          debit_card_sales?: number
          notes?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          created_by?: string
          report_date?: string
          cash_sales?: number
          credit_card_sales?: number
          debit_card_sales?: number
          notes?: string | null
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      report_photos: {
        Row: {
          id: string
          report_id: string
          file_url: string
          file_name: string | null
          file_size: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          report_id: string
          file_url: string
          file_name?: string | null
          file_size?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          uploaded_at?: string
        }
      }
    }
  }
}
