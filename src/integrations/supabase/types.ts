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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamentos_treinamento: {
        Row: {
          confirmado: boolean | null
          created_at: string | null
          id: string
          presente: boolean | null
          profile_id: string
          treinamento_id: string
        }
        Insert: {
          confirmado?: boolean | null
          created_at?: string | null
          id?: string
          presente?: boolean | null
          profile_id: string
          treinamento_id: string
        }
        Update: {
          confirmado?: boolean | null
          created_at?: string | null
          id?: string
          presente?: boolean | null
          profile_id?: string
          treinamento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_treinamento_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_treinamento_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      chamados_internos: {
        Row: {
          assinatura_url: string | null
          cliente_id: string
          created_at: string | null
          data_agendada: string | null
          descricao: string | null
          endereco: string | null
          finalizado_at: string | null
          horario_agendado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          observacoes: string | null
          prioridade: string | null
          status: Database["public"]["Enums"]["chamado_status"]
          tecnico_id: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          assinatura_url?: string | null
          cliente_id: string
          created_at?: string | null
          data_agendada?: string | null
          descricao?: string | null
          endereco?: string | null
          finalizado_at?: string | null
          horario_agendado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observacoes?: string | null
          prioridade?: string | null
          status?: Database["public"]["Enums"]["chamado_status"]
          tecnico_id?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          assinatura_url?: string | null
          cliente_id?: string
          created_at?: string | null
          data_agendada?: string | null
          descricao?: string | null
          endereco?: string | null
          finalizado_at?: string | null
          horario_agendado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          observacoes?: string | null
          prioridade?: string | null
          status?: Database["public"]["Enums"]["chamado_status"]
          tecnico_id?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chamados_internos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chamados_internos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string | null
          created_at: string | null
          id: string
          is_audio: boolean | null
          lida: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_audio?: boolean | null
          lida?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_audio?: boolean | null
          lida?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      excecoes_horario_treinamento: {
        Row: {
          bloqueado: boolean | null
          created_at: string | null
          created_by: string | null
          data: string
          id: string
          motivo: string | null
          slots_personalizados: Json
        }
        Insert: {
          bloqueado?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data: string
          id?: string
          motivo?: string | null
          slots_personalizados?: Json
        }
        Update: {
          bloqueado?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          id?: string
          motivo?: string | null
          slots_personalizados?: Json
        }
        Relationships: [
          {
            foreignKeyName: "excecoes_horario_treinamento_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          cnpj: string | null
          created_at: string | null
          email: string
          empresa: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["user_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          cnpj?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      slots_treinamento: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          vagas_padrao: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          vagas_padrao?: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          vagas_padrao?: number
        }
        Relationships: []
      }
      tecnicos: {
        Row: {
          created_at: string | null
          disponivel: boolean | null
          especialidade: string | null
          id: string
          latitude: number | null
          longitude: number | null
          profile_id: string
          regiao: string | null
        }
        Insert: {
          created_at?: string | null
          disponivel?: boolean | null
          especialidade?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          profile_id: string
          regiao?: string | null
        }
        Update: {
          created_at?: string | null
          disponivel?: boolean | null
          especialidade?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          profile_id?: string
          regiao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnicos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamentos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          created_by: string | null
          data: string
          descricao: string | null
          endereco: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          instrutor: string | null
          link_online: string | null
          tipo: Database["public"]["Enums"]["treinamento_tipo"]
          titulo: string
          vagas_disponiveis: number
          vagas_totais: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data: string
          descricao?: string | null
          endereco?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          instrutor?: string | null
          link_online?: string | null
          tipo?: Database["public"]["Enums"]["treinamento_tipo"]
          titulo: string
          vagas_disponiveis?: number
          vagas_totais?: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          descricao?: string | null
          endereco?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          instrutor?: string | null
          link_online?: string | null
          tipo?: Database["public"]["Enums"]["treinamento_tipo"]
          titulo?: string
          vagas_disponiveis?: number
          vagas_totais?: number
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      chamado_status: "aberto" | "em_andamento" | "finalizado" | "cancelado"
      treinamento_tipo: "online" | "presencial"
      user_type: "cliente" | "tecnico" | "coordenador"
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
      chamado_status: ["aberto", "em_andamento", "finalizado", "cancelado"],
      treinamento_tipo: ["online", "presencial"],
      user_type: ["cliente", "tecnico", "coordenador"],
    },
  },
} as const
