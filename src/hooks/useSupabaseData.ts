import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseData as supabase, PipelineDeal, SdrDiario, FunilPeriodo } from '@/lib/supabase'
import { usePeriod } from '@/contexts/PeriodContext'

// ── Leitura ─────────────────────────────────────────────────
export const useConfig = () => {
  const { periodo } = usePeriod()
  return useQuery({
    queryKey: ['config', periodo],
    queryFn: async () => {
      const { data } = await supabase
        .from('config_mes')
        .select('*')
        .eq('periodo', periodo)
        .maybeSingle()
      return data
    },
    staleTime: 30_000,
    retry: 0,
  })
}

export const usePipeline = () => {
  const { from, to } = usePeriod()
  return useQuery({
    queryKey: ['pipeline', from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline')
        .select('*')
        .gte('data_lead', from)
        .lte('data_lead', to)
        .order('id', { ascending: true })
      if (error) throw error
      return data as PipelineDeal[]
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 1,
  })
}

export const useSdrDiario = () => {
  const { from, to } = usePeriod()
  return useQuery({
    queryKey: ['sdr_diario', from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sdr_diario')
        .select('*')
        .gte('data', from)
        .lte('data', to)
        .order('data', { ascending: true })
      if (error) throw error
      return data as SdrDiario[]
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 1,
  })
}

// ── Funil Manual (snapshot por período) ─────────────────────
export const useFunilPeriodo = () => {
  const { periodo } = usePeriod()
  return useQuery({
    queryKey: ['funil_periodo', periodo],
    queryFn: async () => {
      const { data } = await supabase
        .from('funil_periodo')
        .select('*')
        .eq('periodo', periodo)
        .maybeSingle()
      return data as FunilPeriodo | null
    },
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 0,
  })
}

export const useUpsertFunilPeriodo = () => {
  const qc = useQueryClient()
  const { periodo } = usePeriod()
  return useMutation({
    mutationFn: async (entry: Partial<FunilPeriodo>) => {
      const { data, error } = await supabase
        .from('funil_periodo')
        .upsert({ ...entry, periodo }, { onConflict: 'periodo' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funil_periodo'] }),
  })
}

// ── Escrita — Pipeline ───────────────────────────────────────
export const useAddDeal = () => {
  const qc = useQueryClient()
  const { periodo } = usePeriod()
  return useMutation({
    mutationFn: async (deal: Omit<PipelineDeal, 'id'>) => {
      const { data, error } = await supabase
        .from('pipeline')
        .insert({ ...deal, periodo: deal.periodo ?? periodo })
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
  const { periodo } = usePeriod()
  return useMutation({
    mutationFn: async (entry: Omit<SdrDiario, 'id'>) => {
      const { data, error } = await supabase
        .from('sdr_diario')
        .upsert({ ...entry, periodo: entry.periodo ?? periodo }, { onConflict: 'data' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sdr_diario'] }),
  })
}
