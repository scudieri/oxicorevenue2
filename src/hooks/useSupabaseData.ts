import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseData as supabase, PipelineDeal, SdrDiario } from '@/lib/supabase'

const PERIODO = 'ABR 2026'

// ── Leitura ─────────────────────────────────────────────────
export const useConfig = () =>
  useQuery({
    queryKey: ['config', PERIODO],
    queryFn: async () => {
      const { data } = await supabase
        .from('config_mes')
        .select('*')
        .eq('periodo', PERIODO)
        .maybeSingle()
      return data
    },
    staleTime: 30_000,
    retry: 0,
  })

export const usePipeline = () =>
  useQuery({
    queryKey: ['pipeline', PERIODO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('*')
        .eq('periodo', PERIODO)
        .order('id', { ascending: true })
      if (error) throw error
      return data as PipelineDeal[]
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 1,
  })

export const useSdrDiario = () =>
  useQuery({
    queryKey: ['sdr_diario', PERIODO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sdr_diario')
        .select('*')
        .eq('periodo', PERIODO)
        .order('data', { ascending: true })
      if (error) throw error
      return data as SdrDiario[]
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 1,
  })

// ── Escrita — Pipeline ───────────────────────────────────────
export const useAddDeal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (deal: Omit<PipelineDeal, 'id'>) => {
      const { data, error } = await supabase
        .from('pipeline')
        .insert({ ...deal, periodo: PERIODO })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  })
}

export const useUpdateDeal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<PipelineDeal> & { id: number }) => {
      const { data, error } = await supabase
        .from('pipeline')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  })
}

// ── Escrita — SDR Diário ─────────────────────────────────────
export const useUpsertSdr = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (entry: Omit<SdrDiario, 'id'>) => {
      const { data, error } = await supabase
        .from('sdr_diario')
        .upsert({ ...entry, periodo: PERIODO }, { onConflict: 'data' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sdr_diario'] }),
  })
}
