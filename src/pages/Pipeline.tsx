import { useState } from "react"
import { motion } from "framer-motion"
import { usePipeline, useUpdateDeal } from "@/hooks/useSupabaseData"
import { PipelineDeal } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { ArrowLeft, Search, Pencil, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { usePeriod } from "@/contexts/PeriodContext"
import { PeriodSelector } from "@/components/dashboard/PeriodSelector"

const STATUS_STYLE: Record<string, string> = {
  Fechado:              "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Proposta:             "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "Reunião Acontecida": "bg-sky-500/10 text-sky-400 border-sky-500/30",
  "Reunião Agendada":   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Em Contato":         "bg-teal-500/10 text-teal-400 border-teal-500/30",
  "Stand by":           "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  Lead:                 "bg-violet-500/10 text-violet-400 border-violet-500/30",
  "Sem Contato":        "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  "No Show":            "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Negativou:            "bg-rose-500/10 text-rose-400 border-rose-500/30",
  Desqualificado:       "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
  Perdido:              "bg-red-500/10 text-red-400 border-red-500/30",
}
const TEMP_DOT: Record<string, string> = {
  Quente: "bg-red-500", Morno: "bg-amber-400", Frio: "bg-sky-400"
}
const STATUS_ORDER = ["Fechado","Proposta","Reunião Acontecida","Reunião Agendada","Em Contato","Stand by","Lead","Sem Contato","No Show","Negativou","Desqualificado","Perdido"]
const CANAIS = ["LeadBroker","Recomendação","OutBound"]
const TEMPERATURAS = ["Quente","Morno","Frio"]
const PRODUTOS = ["ONE TIME","Ass. Booking"]
const CLOSERS = ["Bruno","Luís Felipe"]

const fmt = (v: number | null) =>
  v == null ? "—" :
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

interface EditState {
  id: number
  field: string
  value: string
}

export default function Pipeline() {
  const { user }                        = useAuth()
  const { label: periodLabel }          = usePeriod()
  const { data: deals = [], isLoading } = usePipeline()
  const { mutate: updateDeal }          = useUpdateDeal()
  const [search, setSearch]             = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("Todos")
  const [edit, setEdit]                 = useState<EditState | null>(null)

  const isAdmin = user?.role === "admin"

  const filtered = deals
    .filter(d => {
      const q = search.toLowerCase()
      return (
        (filterStatus === "Todos" || d.status === filterStatus) &&
        (d.cliente.toLowerCase().includes(q) ||
         (d.closer ?? "").toLowerCase().includes(q) ||
         (d.sdr ?? "").toLowerCase().includes(q))
      )
    })
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  const totals = {
    pipeline: deals.filter(d => d.status === "Proposta").reduce((s,d) => s+(d.valor??0), 0),
    fechado:  deals.filter(d => d.status === "Fechado").reduce((s,d) => s+(d.valor??0), 0),
    deals:    deals.filter(d => d.status === "Fechado").length,
  }

  const startEdit = (deal: PipelineDeal, field: string, value: string) => {
    if (!isAdmin || !deal.id) return
    setEdit({ id: deal.id, field, value })
  }

  const saveEdit = () => {
    if (!edit) return
    const { id, field, value } = edit
    const parsed: Partial<PipelineDeal> = {}
    if (field === "valor") parsed.valor = parseFloat(value.replace(/[^0-9,.-]/g, "").replace(",", ".")) || null
    else if (field === "data_assinatura") parsed.data_assinatura = value || null
    else (parsed as Record<string, string>)[field] = value
    updateDeal({ id, ...parsed })
    setEdit(null)
  }

  const cancelEdit = () => setEdit(null)

  const isEditing = (deal: PipelineDeal, field: string) =>
    edit?.id === deal.id && edit?.field === field

  const EditableCell = ({
    deal, field, value, display, type = "text", options
  }: {
    deal: PipelineDeal
    field: string
    value: string
    display?: React.ReactNode
    type?: string
    options?: string[]
  }) => {
    if (!isAdmin) return <>{display ?? value}</>

    if (isEditing(deal, field)) {
      if (options) return (
        <select autoFocus value={edit!.value}
          onChange={e => setEdit(prev => prev ? { ...prev, value: e.target.value } : null)}
          onBlur={saveEdit}
          onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit() }}
          className="bg-[#252525] border border-[#E10600]/50 text-white text-xs rounded px-1 py-0.5 outline-none">
          {options.map(o => <option key={o} value={o} className="bg-[#1A1A1A]">{o}</option>)}
        </select>
      )
      return (
        <div className="flex items-center gap-1">
          <input autoFocus type={type} value={edit!.value}
            onChange={e => setEdit(prev => prev ? { ...prev, value: e.target.value } : null)}
            onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit() }}
            className="bg-[#252525] border border-[#E10600]/50 text-white text-xs rounded px-1 py-0.5 outline-none w-28" />
          <button onClick={saveEdit} className="text-[#E10600] hover:opacity-70"><Check className="w-3 h-3" /></button>
          <button onClick={cancelEdit} className="text-gray-500 hover:opacity-70"><X className="w-3 h-3" /></button>
        </div>
      )
    }

    return (
      <button onClick={() => startEdit(deal, field, value)}
        className="group flex items-center gap-1 hover:text-white transition-colors text-left">
        {display ?? value}
        <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 flex-shrink-0" />
      </button>
    )
  }

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
              <h1 className="text-xl font-black text-white uppercase tracking-widest">
                Pipeline <span className="text-[#E10600]">de Leads</span>
              </h1>
            </div>
          </div>
          <PeriodSelector />
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Receita Fechada",  value: fmt(totals.fechado),  color: "text-emerald-400" },
            { label: "Pipeline Aberto",  value: fmt(totals.pipeline), color: "text-amber-400"   },
            { label: "Deals Fechados",   value: String(totals.deals), color: "text-white"        },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
              <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente, closer, SDR..."
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white pl-8 h-9 text-xs" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Todos", ...STATUS_ORDER].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all
                  ${filterStatus === s
                    ? "bg-[#E10600] text-white border-[#E10600]"
                    : "bg-[#1A1A1A] text-gray-500 border-[#2A2A2A] hover:border-[#444]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">
            <Pencil className="w-2.5 h-2.5 inline mr-1" />
            Clique em qualquer campo para editar
          </p>
        )}

        {/* Tabela */}
        {isLoading ? (
          <div className="text-center text-gray-600 py-20 text-sm">Carregando...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#111] border-b border-[#2A2A2A]">
                  {["Cliente","Valor","Status","Temp","Produto","Closer","SDR","Canal","Assinatura"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-gray-600 font-black whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal, i) => (
                  <motion.tr key={deal.id ?? i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors">

                    <td className="px-4 py-3 text-white font-bold whitespace-nowrap">
                      <EditableCell deal={deal} field="cliente" value={deal.cliente} />
                    </td>

                    <td className="px-4 py-3 text-[#E10600] font-bold whitespace-nowrap">
                      <EditableCell deal={deal} field="valor"
                        value={String(deal.valor ?? "")}
                        display={fmt(deal.valor)} />
                    </td>

                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select value={deal.status}
                          onChange={e => deal.id && updateDeal({ id: deal.id, status: e.target.value as PipelineDeal["status"] })}
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border cursor-pointer bg-transparent ${STATUS_STYLE[deal.status]}`}>
                          {STATUS_ORDER.map(s => <option key={s} value={s} className="bg-[#1A1A1A] text-white">{s}</option>)}
                        </select>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${STATUS_STYLE[deal.status]}`}>
                          {deal.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <EditableCell deal={deal} field="temperatura"
                        value={deal.temperatura ?? ""}
                        options={TEMPERATURAS}
                        display={
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${TEMP_DOT[deal.temperatura ?? ""] ?? "bg-gray-600"}`} />
                            <span className="text-gray-400">{deal.temperatura}</span>
                          </div>
                        } />
                    </td>

                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      <EditableCell deal={deal} field="produto"
                        value={deal.produto ?? ""}
                        options={PRODUTOS} />
                    </td>

                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      <EditableCell deal={deal} field="closer"
                        value={deal.closer ?? ""}
                        options={CLOSERS}
                        display={<span>{deal.closer ?? "—"}</span>} />
                    </td>

                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      <EditableCell deal={deal} field="sdr"
                        value={deal.sdr ?? ""}
                        display={<span>{deal.sdr ?? "—"}</span>} />
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <EditableCell deal={deal} field="canal"
                        value={deal.canal ?? ""}
                        options={CANAIS}
                        display={<span>{deal.canal ?? "—"}</span>} />
                    </td>

                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <EditableCell deal={deal} field="data_assinatura"
                        value={deal.data_assinatura ?? ""}
                        type="date"
                        display={<span>
                          {deal.data_assinatura
                            ? new Date(deal.data_assinatura + "T12:00:00").toLocaleDateString("pt-BR")
                            : "—"}
                        </span>} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center text-gray-700 py-12 text-sm">Nenhum deal encontrado</div>
            )}
          </div>
        )}

        <p className="text-center text-[10px] text-gray-700 uppercase tracking-widest pb-8">
          {filtered.length} de {deals.length} deals • V4 Company
        </p>
      </div>
    </div>
  )
}
