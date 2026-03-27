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
      rooms: {
        Row: {
          id: string
          room_number: string
          type: string
          base_price: number
          status: string
          floor: number | null
          capacity: number
          created_at: string
        }
        Insert: {
          id?: string
          room_number: string
          type: string
          base_price: number
          status?: string
          floor?: number | null
          capacity?: number
          created_at?: string
        }
        Update: {
          id?: string
          room_number?: string
          type?: string
          base_price?: number
          status?: string
          floor?: number | null
          capacity?: number
          created_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          nationality: string | null
          preferences: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          nationality?: string | null
          preferences?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          nationality?: string | null
          preferences?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          guest_id: string
          room_id: string
          check_in: string
          check_out: string
          total_price: number
          payment_status: string
          booking_source: string
          status: string
          special_requests: string | null
          created_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          room_id: string
          check_in: string
          check_out: string
          total_price: number
          payment_status?: string
          booking_source?: string
          status?: string
          special_requests?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          room_id?: string
          check_in?: string
          check_out?: string
          total_price?: number
          payment_status?: string
          booking_source?: string
          status?: string
          special_requests?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          status: string
          gateway_reference: string | null
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          status: string
          gateway_reference?: string | null
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          status?: string
          gateway_reference?: string | null
          payment_method?: string | null
          created_at?: string
        }
      }
      housekeeping_logs: {
        Row: {
          id: string
          room_id: string
          status: string
          updated_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          status: string
          updated_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          status?: string
          updated_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
