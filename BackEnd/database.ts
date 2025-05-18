export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      boats: {
        Row: {
          cabin_count: number
          capacity: number
          created_at: string
          description: string
          feature_photo: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          cabin_count?: number
          capacity?: number
          created_at?: string
          description: string
          feature_photo?: string | null
          id?: string
          name: string
          status: string
        }
        Update: {
          cabin_count?: number
          capacity?: number
          created_at?: string
          description?: string
          feature_photo?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      booking_client_details: {
        Row: {
          bed_number: number
          booking_id: string
          cabin_number: string
          category: string | null
          created_at: string
          gender: string | null
          group_name: string | null
          id: string
          name: string | null
          nationality: string | null
          single_use: boolean | null
          surname: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          bed_number: number
          booking_id: string
          cabin_number: string
          category?: string | null
          created_at?: string
          gender?: string | null
          group_name?: string | null
          id?: string
          name?: string | null
          nationality?: string | null
          single_use?: boolean | null
          surname?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          bed_number?: number
          booking_id?: string
          cabin_number?: string
          category?: string | null
          created_at?: string
          gender?: string | null
          group_name?: string | null
          id?: string
          name?: string | null
          nationality?: string | null
          single_use?: boolean | null
          surname?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_client_details_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cabin_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_client_details_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_client_info: {
        Row: {
          address: string | null
          bed_number: number | null
          booking_id: string
          cabin: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: string | null
          diving_level: string | null
          diving_license_type: string | null
          document_uploaded: boolean | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          food_remarks: string | null
          group_name: string | null
          id: string
          name: string | null
          phone: string | null
          postal_code: string | null
          special_needs: string | null
          surname: string | null
          trip_id: string
          updated_at: string
          visa_issue_date: string | null
          visa_number: string | null
        }
        Insert: {
          address?: string | null
          bed_number?: number | null
          booking_id: string
          cabin?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          diving_level?: string | null
          diving_license_type?: string | null
          document_uploaded?: boolean | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          food_remarks?: string | null
          group_name?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          special_needs?: string | null
          surname?: string | null
          trip_id: string
          updated_at?: string
          visa_issue_date?: string | null
          visa_number?: string | null
        }
        Update: {
          address?: string | null
          bed_number?: number | null
          booking_id?: string
          cabin?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          diving_level?: string | null
          diving_license_type?: string | null
          document_uploaded?: boolean | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          food_remarks?: string | null
          group_name?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          postal_code?: string | null
          special_needs?: string | null
          surname?: string | null
          trip_id?: string
          updated_at?: string
          visa_issue_date?: string | null
          visa_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_client_info_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cabin_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_client_info_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_tourism_services: {
        Row: {
          bed_number: number | null
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          price_per_unit: number
          quantity: number | null
          service_date: string | null
          service_name: string
          service_type: string
          status: string | null
          total_price: number
          trip_id: string
          updated_at: string
        }
        Insert: {
          bed_number?: number | null
          booking_id: string
          created_at?: string
          id?: string
          notes?: string | null
          price_per_unit: number
          quantity?: number | null
          service_date?: string | null
          service_name: string
          service_type: string
          status?: string | null
          total_price: number
          trip_id: string
          updated_at?: string
        }
        Update: {
          bed_number?: number | null
          booking_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          price_per_unit?: number
          quantity?: number | null
          service_date?: string | null
          service_name?: string
          service_type?: string
          status?: string | null
          total_price?: number
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_tourism_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cabin_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_tourism_services_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_rentals: {
        Row: {
          bed_number: number | null
          booking_id: string
          brand: string | null
          created_at: string
          equipment_type: string
          id: string
          notes: string | null
          price_per_unit: number
          quantity: number | null
          rent_period_days: number | null
          size: string | null
          status: string | null
          total_price: number
          trip_id: string
          updated_at: string
        }
        Insert: {
          bed_number?: number | null
          booking_id: string
          brand?: string | null
          created_at?: string
          equipment_type: string
          id?: string
          notes?: string | null
          price_per_unit: number
          quantity?: number | null
          rent_period_days?: number | null
          size?: string | null
          status?: string | null
          total_price: number
          trip_id: string
          updated_at?: string
        }
        Update: {
          bed_number?: number | null
          booking_id?: string
          brand?: string | null
          created_at?: string
          equipment_type?: string
          id?: string
          notes?: string | null
          price_per_unit?: number
          quantity?: number | null
          rent_period_days?: number | null
          size?: string | null
          status?: string | null
          total_price?: number
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_rentals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cabin_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rentals_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_travel_info: {
        Row: {
          arrival_airport: string | null
          arrival_date: string | null
          arrival_flight_number: string | null
          arrival_hotel: string | null
          arrival_notes: string | null
          arrival_time: string | null
          bed_number: number | null
          booking_id: string
          created_at: string
          day_use_hotel: string | null
          day_use_hotel_departure: string | null
          departure_airport: string | null
          departure_date: string | null
          departure_flight_number: string | null
          departure_notes: string | null
          departure_time: string | null
          id: string
          name: string | null
          night_hotel: string | null
          night_hotel_departure: string | null
          surname: string | null
          transfer_airport_to_boat: string | null
          transfer_boat_to_airport: string | null
          transfer_boat_to_hotel: string | null
          transfer_boat_to_hotel_departure: string | null
          transfer_details: string | null
          transfer_hotel_to_airport: string | null
          transfer_hotel_to_boat: string | null
          transfer_needed: boolean | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          arrival_airport?: string | null
          arrival_date?: string | null
          arrival_flight_number?: string | null
          arrival_hotel?: string | null
          arrival_notes?: string | null
          arrival_time?: string | null
          bed_number?: number | null
          booking_id: string
          created_at?: string
          day_use_hotel?: string | null
          day_use_hotel_departure?: string | null
          departure_airport?: string | null
          departure_date?: string | null
          departure_flight_number?: string | null
          departure_notes?: string | null
          departure_time?: string | null
          id?: string
          name?: string | null
          night_hotel?: string | null
          night_hotel_departure?: string | null
          surname?: string | null
          transfer_airport_to_boat?: string | null
          transfer_boat_to_airport?: string | null
          transfer_boat_to_hotel?: string | null
          transfer_boat_to_hotel_departure?: string | null
          transfer_details?: string | null
          transfer_hotel_to_airport?: string | null
          transfer_hotel_to_boat?: string | null
          transfer_needed?: boolean | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          arrival_airport?: string | null
          arrival_date?: string | null
          arrival_flight_number?: string | null
          arrival_hotel?: string | null
          arrival_notes?: string | null
          arrival_time?: string | null
          bed_number?: number | null
          booking_id?: string
          created_at?: string
          day_use_hotel?: string | null
          day_use_hotel_departure?: string | null
          departure_airport?: string | null
          departure_date?: string | null
          departure_flight_number?: string | null
          departure_notes?: string | null
          departure_time?: string | null
          id?: string
          name?: string | null
          night_hotel?: string | null
          night_hotel_departure?: string | null
          surname?: string | null
          transfer_airport_to_boat?: string | null
          transfer_boat_to_airport?: string | null
          transfer_boat_to_hotel?: string | null
          transfer_boat_to_hotel_departure?: string | null
          transfer_details?: string | null
          transfer_hotel_to_airport?: string | null
          transfer_hotel_to_boat?: string | null
          transfer_needed?: boolean | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_travel_info_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "cabin_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_travel_info_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      cabin_bookings: {
        Row: {
          bed_number: number
          booked_at: string | null
          cabin_id: string
          cancel_date: string | null
          created_at: string
          id: string
          passenger_gender: string | null
          price: number
          status: string | null
          trip_id: string
        }
        Insert: {
          bed_number: number
          booked_at?: string | null
          cabin_id: string
          cancel_date?: string | null
          created_at?: string
          id?: string
          passenger_gender?: string | null
          price: number
          status?: string | null
          trip_id: string
        }
        Update: {
          bed_number?: number
          booked_at?: string | null
          cabin_id?: string
          cancel_date?: string | null
          created_at?: string
          id?: string
          passenger_gender?: string | null
          price?: number
          status?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabin_bookings_cabin_id_fkey"
            columns: ["cabin_id"]
            isOneToOne: false
            referencedRelation: "cabins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cabin_bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      cabins: {
        Row: {
          base_price: number | null
          bed_count: number
          bed_numbers: string[] | null
          boat_id: string
          cabin_number: string
          cabin_type: Database["public"]["Enums"]["cabin_type"]
          created_at: string
          deck: string
          deck_name: string
          id: string
        }
        Insert: {
          base_price?: number | null
          bed_count: number
          bed_numbers?: string[] | null
          boat_id: string
          cabin_number: string
          cabin_type: Database["public"]["Enums"]["cabin_type"]
          created_at?: string
          deck: string
          deck_name?: string
          id?: string
        }
        Update: {
          base_price?: number | null
          bed_count?: number
          bed_numbers?: string[] | null
          boat_id?: string
          cabin_number?: string
          cabin_type?: Database["public"]["Enums"]["cabin_type"]
          created_at?: string
          deck?: string
          deck_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cabins_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          company: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          company?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          company?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          available_spots: number
          boat_id: string
          booked_spots: number
          created_at: string
          destination: string
          end_date: string
          id: string
          location_from: string
          location_to: string
          price: number
          start_date: string
          status: Database["public"]["Enums"]["trip_status"]
        }
        Insert: {
          available_spots: number
          boat_id: string
          booked_spots?: number
          created_at?: string
          destination: string
          end_date: string
          id?: string
          location_from: string
          location_to: string
          price: number
          start_date: string
          status?: Database["public"]["Enums"]["trip_status"]
        }
        Update: {
          available_spots?: number
          boat_id?: string
          booked_spots?: number
          created_at?: string
          destination?: string
          end_date?: string
          id?: string
          location_from?: string
          location_to?: string
          price?: number
          start_date?: string
          status?: Database["public"]["Enums"]["trip_status"]
        }
        Relationships: [
          {
            foreignKeyName: "trips_boat_id_fkey"
            columns: ["boat_id"]
            isOneToOne: false
            referencedRelation: "boats"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_details: {
        Args: {
          trip_id_param: string
        }
        Returns: {
          bed_number: number
          booking_id: string
          cabin_number: string
          category: string | null
          created_at: string
          gender: string | null
          group_name: string | null
          id: string
          name: string | null
          nationality: string | null
          single_use: boolean | null
          surname: string | null
          trip_id: string
          updated_at: string
        }[]
      }
      get_client_info: {
        Args: {
          trip_id_param: string
        }
        Returns: {
          address: string | null
          bed_number: number | null
          booking_id: string
          cabin: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: string | null
          diving_level: string | null
          diving_license_type: string | null
          document_uploaded: boolean | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          food_remarks: string | null
          group_name: string | null
          id: string
          name: string | null
          phone: string | null
          postal_code: string | null
          special_needs: string | null
          surname: string | null
          trip_id: string
          updated_at: string
          visa_issue_date: string | null
          visa_number: string | null
        }[]
      }
      get_rentals: {
        Args: {
          trip_id_param: string
        }
        Returns: {
          bed_number: number | null
          booking_id: string
          brand: string | null
          created_at: string
          equipment_type: string
          id: string
          notes: string | null
          price_per_unit: number
          quantity: number | null
          rent_period_days: number | null
          size: string | null
          status: string | null
          total_price: number
          trip_id: string
          updated_at: string
        }[]
      }
      get_tourism_services: {
        Args: {
          trip_id_param: string
        }
        Returns: {
          bed_number: number | null
          booking_id: string
          created_at: string
          id: string
          notes: string | null
          price_per_unit: number
          quantity: number | null
          service_date: string | null
          service_name: string
          service_type: string
          status: string | null
          total_price: number
          trip_id: string
          updated_at: string
        }[]
      }
      get_travel_info: {
        Args: {
          trip_id_param: string
        }
        Returns: {
          arrival_airport: string | null
          arrival_date: string | null
          arrival_flight_number: string | null
          arrival_hotel: string | null
          arrival_notes: string | null
          arrival_time: string | null
          bed_number: number | null
          booking_id: string
          created_at: string
          day_use_hotel: string | null
          day_use_hotel_departure: string | null
          departure_airport: string | null
          departure_date: string | null
          departure_flight_number: string | null
          departure_notes: string | null
          departure_time: string | null
          id: string
          name: string | null
          night_hotel: string | null
          night_hotel_departure: string | null
          surname: string | null
          transfer_airport_to_boat: string | null
          transfer_boat_to_airport: string | null
          transfer_boat_to_hotel: string | null
          transfer_boat_to_hotel_departure: string | null
          transfer_details: string | null
          transfer_hotel_to_airport: string | null
          transfer_hotel_to_boat: string | null
          transfer_needed: boolean | null
          trip_id: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      cabin_type: "twin_beds" | "twin_beds_bunk" | "suite_double"
      trip_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      user_role: "admin" | "agent" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export interface CabinBooking {
  id: string;
  created_at: string;
  trip_id: string;
  cabin_id: string;
  bed_number: number;
  booked_at: string | null;
  price: number;
  status: string | null;
  passenger_gender: string | null;
  cancel_date: string | null;
  group_name: string | null;
}

export type Boat = Database["public"]["Tables"]["boats"]["Row"];
export type BoatInsert = Database["public"]["Tables"]["boats"]["Insert"];
export type BoatUpdate = Database["public"]["Tables"]["boats"]["Update"];

export type Cabin = Database["public"]["Tables"]["cabins"]["Row"];
export type CabinInsert = Database["public"]["Tables"]["cabins"]["Insert"];
export type CabinUpdate = Database["public"]["Tables"]["cabins"]["Update"];

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
export type TripUpdate = Database["public"]["Tables"]["trips"]["Update"];

export type BookingClientDetails = Database["public"]["Tables"]["booking_client_details"]["Row"];
export type BookingClientInfo = Database["public"]["Tables"]["booking_client_info"]["Row"];
export type BookingTravelInfo = Database["public"]["Tables"]["booking_travel_info"]["Row"];
export type BookingTourismServices = Database["public"]["Tables"]["booking_tourism_services"]["Row"];
export type BookingRentals = Database["public"]["Tables"]["booking_rentals"]["Row"];

export interface DeckPhoto {
  id: string;
  created_at: string;
  boat_id: string;
  deck: string;
  photo_url: string | null;
}
