import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL          = import.meta.env.VITE_SUPABASE_URL          ?? "https://hrfgkjrgfqeztybgrzmj.supabase.co"
const SUPABASE_ANON         = import.meta.env.VITE_SUPABASE_ANON_KEY     ?? ""
const SUPABASE_SERVICE_ROLE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE ?? SUPABASE_ANON

// Cliente de auth — usa anon key, mantém sessão do usuário
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// Cliente de dados — usa service_role, nunca usa sessão do usuário, ignora RLS
export const supabaseData = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ── Tipos das tabelas ───────────────────────────────────────
export interface PipelineDeal {
  id?: number
  cliente: string
  valor: number | null
  status: 'Fechado' | 'Proposta' | 'Negativou' | 'Stand by' | 'Lead' | 'Sem Contato' | 'Desqualificado' | 'Perdido' | 'Em Contato' | 'Reunião Agendada' | 'Reunião Acontecida' | 'No Show'
  temperatura: 'Quente' | 'Morno' | 'Frio' | null
  data_lead?: string
  canal?: string
  produto?: 'ONE TIME' | 'Ass. Booking'
  closer?: string
  sdr?: string
  data_assinatura?: string | null
  periodo?: string
}

export interface SdrDiario {
  id?: number
  data: string
  dia_semana?: string
  show?: number
  no_show?: number
  marcadas?: number
  remarcada?: number
  obs?: string
  periodo?: string
}

export interface FunilPeriodo {
  periodo: string
  total_leads: number | null
  marcados: number | null
  acontecidos: number | null
  vendas: number | null
  receita: number | null
  investimento: number | null
  obs?: string | null
  atualizado_em?: string
}

export interface ConfigMes {
  id?: number
  periodo: string
  meta_total: number
  meta_onetime: number
  meta_mrr: number
  investimento: number
  canal_aquisicao: string
  dias_uteis_mes: number
  dias_uteis_hoje: number
}
