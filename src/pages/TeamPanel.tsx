import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp, Calendar as CalIcon, Users, Trophy } from "lucide-react"
import { usePipeline, useSdrDiario } from "@/hooks/useSupabaseData"
import { usePeriod } from "@/contexts/PeriodContext"
import { PeriodSelector } from "@/components/dashboard/PeriodSelector"

import brunoPic  from "@/assets/bruno.png"
import felipePic from "@/assets/felipe.png"
import joaoPic   from "@/assets/joao.png"

const AVATARS: Record<string, string> = {
  "Bruno":        brunoPic,
  "Luís Felipe":  felipePic,
  "Luis Felipe":  felipePic,
  "João Gabriel": joaoPic,
  "João":         joaoPic,
}

const CLOSERS = ["Bruno", "Luís Felipe"]
const SDRS    = ["João Gabriel"]

const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

const fmtDate = (s: string) => {
  const [y, m, d] = s.split("-")
  return `${d}/${m}`
}

const dayNames = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

export default function TeamPanel() {
  const { label: periodLabel } = usePeriod()
  const { data: deals = [] }   = usePipeline()
  const { data: sdrDiario = [] } = useSdrDiario()
  const [selected, setSelected] = useState<string>(CLOSERS[0])

  const isCloser = CLOSERS.includes(selected)

  // ── Closer: agrupa pipeline por dia (usa data_assinatura para fechados; data_lead p/ outros) ──
  const closerDaily = useMemo(() => {
    if (!isCloser) return []
    const mine = deals.filter(d => d.closer === selected)
    const byDay: Record<string, { fechados: number; receita: number; propostas: number; negativou: number; standby: number }> = {}
    for (const d of mine) {
      const key = d.data_assinatura ?? d.data_lead ?? ""
      if (!key) continue
      if (!byDay[key]) byDay[key] = { fechados: 0, receita: 0, propostas: 0, negativou: 0, standby: 0 }
      if (d.status === "Fechado")    { byDay[key].fechados++; byDay[key].receita += d.valor ?? 0 }
      if (d.status === "Proposta")   byDay[key].propostas++
      if (d.status === "Negativou")  byDay[key].negativou++
      if (d.status === "Stand by")   byDay[key].standby++
    }
    return Object.entries(byDay)
      .map(([data, v]) => ({ data, ...v }))
      .sort((a, b) => a.data.localeCompare(b.data))
  }, [deals, selected, isCloser])

  const closerTotals = useMemo(() => {
    if (!isCloser) return null
    const mine = deals.filter(d => d.closer === selected)
    const fechados  = mine.filter(d => d.status === "Fechado")
    const propostas = mine.filter(d => d.status === "Proposta")
    return {
      receita:    fechados.reduce((s, d) => s + (d.valor ?? 0), 0),
      pipeline:   propostas.reduce((s, d) => s + (d.valor ?? 0), 0),
      vendas:     fechados.length,
      propostas:  propostas.length,
      negativou:  mine.filter(d => d.status === "Negativou").length,
      total:      mine.length,
      ticket:     fechados.length > 0 ? fechados.reduce((s,d) => s+(d.valor??0),0) / fechados.length : 0,
    }
  }, [deals, selected, isCloser])

  // ── SDR: usa sdr_diario direto ──
  const sdrDaily = useMemo(() => {
    if (isCloser) return []
    return sdrDiario.map(s => ({
      data: s.data,
      dia: s.dia_semana,
      marcadas: s.marcadas ?? 0,
      shows:    s.show     ?? 0,
      noshow:   s.no_show  ?? 0,
      remar:    s.remarcada ?? 0,
    }))
  }, [sdrDiario, isCloser])

  const sdrTotals = useMemo(() => {
    if (isCloser) return null
    const m = sdrDiario.reduce((s,d) => s+(d.marcadas??0), 0)
    const sh = sdrDiario.reduce((s,d) => s+(d.show??0), 0)
    const ns = sdrDiario.reduce((s,d) => s+(d.no_show??0), 0)
    const re = sdrDiario.reduce((s,d) => s+(d.remarcada??0), 0)
    const showRate = m > 0 ? (sh / m) * 100 : 0
    return { marcadas: m, shows: sh, noshow: ns, remar: re, showRate }
  }, [sdrDiario, isCloser])

  // Avatar pick
  const avatar = AVATARS[selected]

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">{periodLabel}</p>
              <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E10600]" />
                Players <span className="text-[#E10600]">Performance</span>
              </h1>
            </div>
          </div>
          <PeriodSelector />
        </div>

        {/* Tabs de jogadores */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 flex items-center gap-2">
            <Trophy className="w-3 h-3" /> Closers
          </p>
          <div className="flex flex-wrap gap-3">
            {CLOSERS.map(name => (
              <PlayerChip key={name} name={name} active={selected === name} onClick={() => setSelected(name)} />
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 flex items-center gap-2 pt-2">
            <TrendingUp className="w-3 h-3" /> SDRs
          </p>
          <div className="flex flex-wrap gap-3">
            {SDRS.map(name => (
              <PlayerChip key={name} name={name} active={selected === name} onClick={() => setSelected(name)} />
            ))}
          </div>
        </div>

        {/* Painel do jogador */}
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cabeçalho do jogador */}
          <div className="glass-neu p-6 flex items-center gap-5">
            {avatar && <img src={avatar} alt={selected} className="w-16 h-16 rounded-full object-cover border-2 border-[#E10600]/40" />}
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600">{isCloser ? "Closer" : "SDR"}</p>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">{selected}</h2>
            </div>
          </div>

          {/* Stats summary */}
          {isCloser && closerTotals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Receita"      value={fmtBRL(closerTotals.receita)} primary />
              <Stat label="Pipeline"     value={fmtBRL(closerTotals.pipeline)} />
              <Stat label="Vendas"       value={String(closerTotals.vendas)} accent />
              <Stat label="Ticket Médio" value={fmtBRL(closerTotals.ticket)} />
              <Stat label="Propostas"    value={String(closerTotals.propostas)} />
              <Stat label="Negativou"    value={String(closerTotals.negativou)} />
              <Stat label="Total Deals"  value={String(closerTotals.total)} />
              <Stat label="Conv. Rate"   value={closerTotals.total > 0 ? `${((closerTotals.vendas/closerTotals.total)*100).toFixed(0)}%` : "0%"} />
            </div>
          )}

          {!isCloser && sdrTotals && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Marcadas"  value={String(sdrTotals.marcadas)} primary />
              <Stat label="Shows"     value={String(sdrTotals.shows)} accent />
              <Stat label="No-Show"   value={String(sdrTotals.noshow)} />
              <Stat label="Remarcada" value={String(sdrTotals.remar)} />
              <Stat label="Show Rate" value={`${sdrTotals.showRate.toFixed(0)}%`} primary />
            </div>
          )}

          {/* Tabela diária */}
          <div className="glass-neu p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222] flex items-center gap-2">
              <CalIcon className="w-3.5 h-3.5 text-[#E10600]" />
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black">
                Progresso Diário
              </h3>
            </div>

            <div className="overflow-x-auto">
              {isCloser ? (
                <table className="w-full text-sm">
                  <thead className="bg-[#0D0D0D]">
                    <tr className="text-[9px] uppercase tracking-widest text-gray-600">
                      <th className="text-left px-6 py-3">Data</th>
                      <th className="text-right px-3 py-3">Fechados</th>
                      <th className="text-right px-3 py-3">Receita</th>
                      <th className="text-right px-3 py-3">Propostas</th>
                      <th className="text-right px-3 py-3">Negativou</th>
                      <th className="text-right px-6 py-3">Stand by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closerDaily.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-700 text-xs uppercase tracking-widest">Sem atividade no período</td></tr>
                    ) : closerDaily.map(row => (
                      <tr key={row.data} className="border-t border-[#1A1A1A] hover:bg-[#1A1A1A]/40 transition-colors">
                        <td className="px-6 py-3 text-white font-bold">{fmtDate(row.data)}</td>
                        <td className="px-3 py-3 text-right text-[#E10600] font-mono font-black">{row.fechados || "—"}</td>
                        <td className="px-3 py-3 text-right text-[#E10600] font-mono">{row.receita > 0 ? fmtBRL(row.receita) : "—"}</td>
                        <td className="px-3 py-3 text-right text-[#E10600] font-mono">{row.propostas || "—"}</td>
                        <td className="px-3 py-3 text-right text-red-400 font-mono">{row.negativou || "—"}</td>
                        <td className="px-6 py-3 text-right text-gray-300 font-mono">{row.standby || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#0D0D0D]">
                    <tr className="text-[9px] uppercase tracking-widest text-gray-600">
                      <th className="text-left px-6 py-3">Data</th>
                      <th className="text-left px-3 py-3">Dia</th>
                      <th className="text-right px-3 py-3">Marcadas</th>
                      <th className="text-right px-3 py-3">Shows</th>
                      <th className="text-right px-3 py-3">No-Show</th>
                      <th className="text-right px-6 py-3">Remarcada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sdrDaily.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-700 text-xs uppercase tracking-widest">Sem atividade no período</td></tr>
                    ) : sdrDaily.map(row => (
                      <tr key={row.data} className="border-t border-[#1A1A1A] hover:bg-[#1A1A1A]/40 transition-colors">
                        <td className="px-6 py-3 text-white font-bold">{fmtDate(row.data)}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs uppercase tracking-widest">{row.dia ?? dayNames[new Date(row.data).getDay()]}</td>
                        <td className="px-3 py-3 text-right text-[#E10600] font-mono font-black">{row.marcadas || "—"}</td>
                        <td className="px-3 py-3 text-right text-white font-mono">{row.shows || "—"}</td>
                        <td className="px-3 py-3 text-right text-red-400 font-mono">{row.noshow || "—"}</td>
                        <td className="px-6 py-3 text-right text-[#E10600] font-mono">{row.remar || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const PlayerChip = ({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) => {
  const avatar = AVATARS[name]
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all ${
        active
          ? "bg-[#1A1A1A] border-[#E10600] text-[#E10600]"
          : "bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-[#555] hover:text-white"
      }`}
    >
      {avatar && <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover" />}
      <span className="text-xs font-black uppercase tracking-widest">{name}</span>
    </button>
  )
}

const Stat = ({ label, value, primary, accent }: { label: string; value: string; primary?: boolean; accent?: boolean }) => (
  <div className={`glass-neu p-4 ${primary ? "border-l-2 border-[#E10600]" : accent ? "border-l-2 border-white/30" : ""}`}>
    <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold">{label}</p>
    <p className={`text-xl font-black mt-1 font-mono ${primary ? "text-[#E10600]" : accent ? "text-white" : "text-white"}`}>{value}</p>
  </div>
)
