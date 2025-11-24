export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          display_name: string | null
          email: string
          expires_at: string
          id: string
          invited_at: string | null
          invited_by: string
          organization_id: string
          phone: string | null
          service_zones: string[] | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          display_name?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_at?: string | null
          invited_by: string
          organization_id: string
          phone?: string | null
          service_zones?: string[] | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          display_name?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          organization_id?: string
          phone?: string | null
          service_zones?: string[] | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          id: string
          record_id: string | null
          table_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_published: boolean | null
          last_agent_interaction: string | null
          organization_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          last_agent_interaction?: string | null
          organization_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          last_agent_interaction?: string | null
          organization_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_inquiries: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to_agent: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization_id: string
          phone: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to_agent?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization_id: string
          phone?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to_agent?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization_id?: string
          phone?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_assigned_to_agent_fkey"
            columns: ["assigned_to_agent"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_definitions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      field_definitions: {
        Row: {
          created_at: string | null
          display_order: number | null
          entity_id: string | null
          field_type: string
          id: string
          label: string
          name: string
          options: Json | null
          validation: Json | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          entity_id?: string | null
          field_type: string
          id?: string
          label: string
          name: string
          options?: Json | null
          validation?: Json | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          entity_id?: string | null
          field_type?: string
          id?: string
          label?: string
          name?: string
          options?: Json | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "field_definitions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entity_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_status: string | null
          brand_colors: Json | null
          commission_rate: number | null
          contact_email: string
          created_at: string | null
          domain: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          slug: string
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          billing_status?: string | null
          brand_colors?: Json | null
          commission_rate?: number | null
          contact_email: string
          created_at?: string | null
          domain?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          slug: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_status?: string | null
          brand_colors?: Json | null
          commission_rate?: number | null
          contact_email?: string
          created_at?: string | null
          domain?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          slug?: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_level: Database["public"]["Enums"]["agent_level"] | null
          agent_license_number: string | null
          agent_specialty: string[] | null
          agent_years_experience: number | null
          bio: string | null
          bio_en: string | null
          bio_es: string | null
          completed_at: string | null
          created_at: string | null
          display_name: string
          email: string
          email_preference: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          facebook_url: string | null
          id: string
          instagram_handle: string | null
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          is_complete: boolean | null
          is_featured: boolean | null
          job_title: string | null
          languages: string[] | null
          linkedin_url: string | null
          organization_id: string | null
          phone: string | null
          photo_url: string | null
          professional_email: string | null
          role: Database["public"]["Enums"]["user_role"]
          service_zones: string[] | null
          show_in_directory: boolean | null
          social_links: Json | null
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          agent_level?: Database["public"]["Enums"]["agent_level"] | null
          agent_license_number?: string | null
          agent_specialty?: string[] | null
          agent_years_experience?: number | null
          bio?: string | null
          bio_en?: string | null
          bio_es?: string | null
          completed_at?: string | null
          created_at?: string | null
          display_name: string
          email: string
          email_preference?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_handle?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          is_complete?: boolean | null
          is_featured?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          professional_email?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          service_zones?: string[] | null
          show_in_directory?: boolean | null
          social_links?: Json | null
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          agent_level?: Database["public"]["Enums"]["agent_level"] | null
          agent_license_number?: string | null
          agent_specialty?: string[] | null
          agent_years_experience?: number | null
          bio?: string | null
          bio_en?: string | null
          bio_es?: string | null
          completed_at?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          email_preference?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          facebook_url?: string | null
          id?: string
          instagram_handle?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          is_complete?: boolean | null
          is_featured?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          linkedin_url?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          professional_email?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          service_zones?: string[] | null
          show_in_directory?: boolean | null
          social_links?: Json | null
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          agent_id: string | null
          amenities: string[] | null
          created_at: string
          created_by: string | null
          description_en: string | null
          description_es: string | null
          featured: boolean | null
          features: Json
          id: string
          image_variants: Json | null
          is_translation_of: string | null
          language: string | null
          location: Json
          operation: Database["public"]["Enums"]["property_operation"]
          organization_id: string
          price: number
          published_date: string | null
          status: Database["public"]["Enums"]["property_status"]
          title_en: string
          title_es: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_es?: string | null
          featured?: boolean | null
          features?: Json
          id?: string
          image_variants?: Json | null
          is_translation_of?: string | null
          language?: string | null
          location?: Json
          operation: Database["public"]["Enums"]["property_operation"]
          organization_id: string
          price: number
          published_date?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title_en: string
          title_es: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_es?: string | null
          featured?: boolean | null
          features?: Json
          id?: string
          image_variants?: Json | null
          is_translation_of?: string | null
          language?: string | null
          location?: Json
          operation?: Database["public"]["Enums"]["property_operation"]
          organization_id?: string
          price?: number
          published_date?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          title_en?: string
          title_es?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_is_translation_of_fkey"
            columns: ["is_translation_of"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text_en: string | null
          alt_text_es: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          property_id: string
        }
        Insert: {
          alt_text_en?: string | null
          alt_text_es?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          property_id: string
        }
        Update: {
          alt_text_en?: string | null
          alt_text_es?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_visits: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          organization_id: string
          phone: string
          preferred_date: string
          preferred_time: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          organization_id: string
          phone: string
          preferred_date: string
          preferred_time: string
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          organization_id?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_visits_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      service_zones: {
        Row: {
          active: boolean
          created_at: string
          description_en: string | null
          description_es: string | null
          display_order: number
          id: string
          image_url: string | null
          name_en: string
          name_es: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name_en: string
          name_es: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_es?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name_en?: string
          name_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_temp_storage_images: { Args: never; Returns: undefined }
      get_user_email: { Args: { target_user_id: string }; Returns: string }
      has_role:
        | {
            Args: {
              _org_id?: string
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      promote_user_to_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      agent_level: "junior" | "associate" | "senior" | "partner"
      app_role: "admin" | "user" | "superadmin"
      property_operation: "venta" | "renta"
      property_status: "disponible" | "vendida" | "rentada" | "pendiente"
      property_type: "casa" | "departamento" | "local" | "oficina" | "terrenos"
      user_role: "superadmin" | "admin" | "agent" | "client" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_level: ["junior", "associate", "senior", "partner"],
      app_role: ["admin", "user", "superadmin"],
      property_operation: ["venta", "renta"],
      property_status: ["disponible", "vendida", "rentada", "pendiente"],
      property_type: ["casa", "departamento", "local", "oficina", "terrenos"],
      user_role: ["superadmin", "admin", "agent", "client", "user"],
    },
  },
} as const
