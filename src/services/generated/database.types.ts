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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      allergens: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      app_data_mutations: {
        Row: {
          created_at: string
          mutation_id: string
          request_hash: string
          response_json: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          mutation_id: string
          request_hash: string
          response_json: Json
          user_id: string
        }
        Update: {
          created_at?: string
          mutation_id?: string
          request_hash?: string
          response_json?: Json
          user_id?: string
        }
        Relationships: []
      }
      app_data_snapshots: {
        Row: {
          data: Json
          revision: number
          updated_at: string
          user_id: string
        }
        Insert: {
          data: Json
          revision?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          revision?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ingredient_allergens: {
        Row: {
          allergen_id: string
          ingredient_id: string
        }
        Insert: {
          allergen_id: string
          ingredient_id: string
        }
        Update: {
          allergen_id?: string
          ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_allergens_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_name: string
          shopping_group: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_name: string
          shopping_group: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string
          shopping_group?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          ingredient_id: string | null
          name: string
          normalized_name: string
          quantity: number | null
          unit_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          name: string
          normalized_name: string
          quantity?: number | null
          unit_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          name?: string
          normalized_name?: string
          quantity?: number | null
          unit_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_id: string
          position: number
          quantity: number
          recipe_id: string
          unit_code: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          position: number
          quantity: number
          recipe_id: string
          unit_code: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          position?: number
          quantity?: number
          recipe_id?: string
          unit_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          id: string
          position: number
          recipe_id: string
          text: string
        }
        Insert: {
          id?: string
          position: number
          recipe_id: string
          text: string
        }
        Update: {
          id?: string
          position?: number
          recipe_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          base_servings: number
          created_at: string
          id: string
          is_active: boolean
          minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          base_servings: number
          created_at?: string
          id: string
          is_active?: boolean
          minutes: number
          title: string
          updated_at?: string
        }
        Update: {
          base_servings?: number
          created_at?: string
          id?: string
          is_active?: boolean
          minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_plan_revisions: {
        Row: {
          created_at: string
          id: string
          portions: number
          version: number
          weekly_plan_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          portions: number
          version: number
          weekly_plan_id: string
        }
        Update: {
          created_at?: string
          id?: string
          portions?: number
          version?: number
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_plan_revisions_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_plan_slots: {
        Row: {
          day_index: number
          meal_index: number
          recipe_id: string
          revision_id: string
        }
        Insert: {
          day_index: number
          meal_index: number
          recipe_id: string
          revision_id: string
        }
        Update: {
          day_index?: number
          meal_index?: number
          recipe_id?: string
          revision_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_plan_slots_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_plan_slots_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "saved_plan_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_candidates: {
        Row: {
          confidence: number | null
          id: string
          ingredient_id: string | null
          position: number
          scan_job_id: string
          suggested_name: string
        }
        Insert: {
          confidence?: number | null
          id?: string
          ingredient_id?: string | null
          position: number
          scan_job_id: string
          suggested_name: string
        }
        Update: {
          confidence?: number | null
          id?: string
          ingredient_id?: string | null
          position?: number
          scan_job_id?: string
          suggested_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_candidates_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_candidates_scan_job_id_fkey"
            columns: ["scan_job_id"]
            isOneToOne: false
            referencedRelation: "scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_jobs: {
        Row: {
          created_at: string
          error_code: string | null
          expires_at: string
          id: string
          idempotency_key: string
          image_object_key: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          expires_at: string
          id?: string
          idempotency_key: string
          image_object_key?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_code?: string | null
          expires_at?: string
          id?: string
          idempotency_key?: string
          image_object_key?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_item_checks: {
        Row: {
          dimension_key: string
          ingredient_id: string
          is_checked: boolean
          revision_id: string
          updated_at: string
        }
        Insert: {
          dimension_key: string
          ingredient_id: string
          is_checked?: boolean
          revision_id: string
          updated_at?: string
        }
        Update: {
          dimension_key?: string
          ingredient_id?: string
          is_checked?: boolean
          revision_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_item_checks_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_item_checks_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "saved_plan_revisions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_allergies: {
        Row: {
          allergen_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          allergen_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          allergen_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_allergies_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          default_portions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_portions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_portions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recipes: {
        Row: {
          created_at: string
          id: string
          recipe: Json
          source_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          recipe: Json
          source_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe?: Json
          source_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_plan_slots: {
        Row: {
          day_index: number
          meal_index: number
          recipe_id: string
          weekly_plan_id: string
        }
        Insert: {
          day_index: number
          meal_index: number
          recipe_id: string
          weekly_plan_id: string
        }
        Update: {
          day_index?: number
          meal_index?: number
          recipe_id?: string
          weekly_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plan_slots_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_plan_slots_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          created_at: string
          draft_portions: number
          id: string
          published_revision_id: string | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          draft_portions: number
          id?: string
          published_revision_id?: string | null
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          draft_portions?: number
          id?: string
          published_revision_id?: string | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_weekly_plans_published_revision"
            columns: ["id", "published_revision_id"]
            isOneToOne: false
            referencedRelation: "saved_plan_revisions"
            referencedColumns: ["weekly_plan_id", "id"]
          },
        ]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
