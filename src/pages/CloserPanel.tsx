import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { usePipeline, useUpdateDeal } from "@/hooks/useSupabaseData"
import { supabaseData } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { PipelineDeal } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut, Search, CheckCircle2, ChevronRight, BarChart2, ClipboardList } from "lucide-react"

const CLOSER_STATUS = [
  { key: "apresentacao_proposta", label: "Proposta Apresentada", color: "border-[#E10600] text-[#E10600] bg-[#E10600]/10", dot: "bg-gray-400", pipelineStatus: "Proposta" as PipelineDeal["status"] },
  { key: "venda_realizada",       label: "Venda Fechada",        color: "border-[#E10600] text-[#E10600] bg-[#E10600]/10",     dot: "bg-[#E10600]",  pipelineStatus: "Fechado"  as PipelineDeal["status"] },
  { key: "standby",               label: "Stand By",             color: "border-gray-400 text-gray-400 bg-gray-400/10",         dot: "bg-gray-400",   pipelineStatus: "Stand by" as PipelineDeal["status"] },
  { key: "venda_nao_realizada",   label: "Negativou",            color: "border-red-400 text-red-400 bg-red-400/10",            dot: "bg-red-500",    pipelineStatus: "Negativou" as PipelineDeal["status"] },
]

const TEMP_DOT: Record<string, string> = { Quente: "bg-red-500", Morno: "bg-gray-400", Frio: "bg-gray-400" }

const fmt = (v: number | null) =>
  v == null ? "—" :
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

export default function CloserPanel() {
  const { user, signOut }       = useAuth()
  const navigate                = useNavigate()
  const { data: deals = [] }    = usePipeline()
  const { mutate: updateDeal }  = useUpdateDeal()
  const qc                      = useQueryClient()

  const [tab, setTab]           = useState<"registrar" | "stats">("registrar")
  const [search, setSearch]     = useState("")
  const [selected, setSelected] = useState<PipelineDeal | null>(null)
  const [status, setStatus]     = useState("")
  const [obs, setObs]           = useState("")
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  if (!user) { navigate("/login"); return null }
  if (user.role !== "closer" && user.role !== "admin") { navigate("/"); return null }

  const myDeals = deals.filter(d => {
    const nameMatch = user.role === "admin" || d.closer === user.nome
    return nameMatch && d.cliente.toLowerCase().includes(search.toLowerCase())
  })

  // Stats — filtrados pelo closer logado (ou todos se admin)
  const myAllDeals = user.role === "admin" ? deals : deals.filter(d => d.closer === user.nome)
  const fechados   = myAllDeals.filter(d => d.status === "Fechado")
  const propostas  = myAllDeals.filter(d => d.status === "Proposta")
  const negativou  = myAllDeals.filter(d => d.status === "Negativou")
  const standby    = myAllDeals.filter(d => d.status === "Stand by")
  const receita    = fechados.reduce((s, d) => s + (d.valor ?? 0), 0)
  const pipeline   = propostas.reduce((s, d) => s + (d.valor ?? 0), 0)
  const ticket     = fechados.length > 0 ? receita / fechados.length : 0
  const convRate   = myAllDeals.length > 0 ? Math.round((fechados.length / myAllDeals.length) * 100) : 0

  const selectedStatusDef = CLOSER_STATUS.find(s => s.key === status)

  const handleSave = async () => {
    if (!selected || !status) return
    setSaving(true)
    await supabaseData.from("atividades").insert({
      deal_id: selected.id, tipo: "closer", usuario: user.nome,
      status, obs, data: date,
    })
    if (selectedStatusDef?.pipelineStatus && selected.id) {
      updateDeal({ id: selected.id, status: selectedStatusDef.pipelineStatus })
    }
    qc.invalidateQueries({ queryKey: ["pipeline"] })
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); setSelected(null); setStatus(""); setObs(""); setSearch("") }, 2500)
  }

  const handleLogout = async () => { await signOut(); navigate("/login") }

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">Closer</p>
            <h1 className="text-xl font-black text-white uppercase tracking-widest">
              <span className="text-[#E10600]">{user.nome}</span>
            </h1>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-gray-600 hover:text-red-400 text-xs uppercase tracking-widest transition-colors">
            <LogOut className="w-3 h-3" /> Sair
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "registrar", label: "Registrar",    icon: ClipboardList },
            { key: "stats",     label: "Meus Números", icon: BarChart2 },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${tab === key
                  ? "bg-[#E10600]/10 border border-[#E10600] text-[#E10600]"
                  : "border border-[#2A2A2A] text-gray-600 hover:text-white"}`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STATS ── */}
          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5">

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Receita",   value: fmt(receita),  color: "text-[#E10600]" },
                  { label: "Pipeline",  value: fmt(pipeline), color: "text-[#E10600]" },
                  { label: "Fechados",  value: fechados.length,  color: "text-[#E10600]" },
                  { label: "Propostas", value: propostas.length, color: "text-[#E10600]" },
                  { label: "Negativou", value: negativou.length, color: "text-red-400"    },
                  { label: "Stand By",  value: standby.length,   color: "text-gray-400"  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-white">{convRate}%</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Conv. Rate</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-[#E10600]">{fmt(ticket)}</p>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Ticket Médio</p>
                </div>
              </div>

              {/* Lista de fechados */}
              {fechados.length > 0 && (
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black px-4 py-2 border-b border-[#2A2A2A]">
                    Deals Fechados
                  </p>
                  {fechados.map(d => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1E1E]">
                      <p className="text-white text-sm font-bold">{d.cliente}</p>
                      <p className="text-[#E10600] font-bold text-xs">{fmt(d.valor)}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── REGISTRAR — step 1 ── */}
          {tab === "registrar" && !selected && !saved && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar empresa..." autoFocus
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white pl-8 h-11" />
              </div>
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                {myDeals.map(deal => (
                  <motion.button key={deal.id} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(deal)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3
                               flex items-center justify-between hover:border-[#E10600]/40 transition-all text-left">
                    <div>
                      <p className="text-white font-bold text-sm">{deal.cliente}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#E10600] text-xs font-bold">{fmt(deal.valor)}</span>
                        <span className="text-gray-700 text-xs">·</span>
                        <span className="text-gray-600 text-xs">{deal.produto}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${TEMP_DOT[deal.temperatura ?? ""] ?? "bg-gray-600"}`} />
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </motion.button>
                ))}
                {myDeals.length === 0 && (
                  <p className="text-center text-gray-700 py-8 text-sm">Nenhum lead encontrado</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── REGISTRAR — step 2 ── */}
          {tab === "registrar" && selected && !saved && (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[#E10600] font-black">{selected.cliente}</p>
                  <p className="text-gray-600 text-xs">{fmt(selected.valor)} · {selected.produto}</p>
                </div>
                <button onClick={() => { setSelected(null); setStatus("") }}
                  className="text-gray-600 hover:text-white text-xs">✕</button>
              </div>

              <div className="space-y-2">
                {CLOSER_STATUS.map(s => (
                  <motion.button key={s.key} whileTap={{ scale: 0.99 }}
                    onClick={() => setStatus(s.key)}
                    className={`w-full py-4 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-4
                      ${status === s.key ? s.color : "border-[#2A2A2A] text-gray-600 bg-transparent"}`}>
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${status === s.key ? s.dot : "bg-[#333]"}`} />
                    <p className="font-black text-sm uppercase tracking-widest">{s.label}</p>
                  </motion.button>
                ))}
              </div>

              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Data</p>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white h-11" />
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Observação</p>
                <Input value={obs} onChange={e => setObs(e.target.value)}
                  placeholder="opcional"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white h-11" />
              </div>

              <Button onClick={handleSave} disabled={!status || saving}
                className="w-full h-12 bg-[#E10600] text-white font-black uppercase tracking-widest hover:bg-[#b00500] disabled:opacity-30">
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </motion.div>
          )}

          {/* ── CONFIRMAÇÃO ── */}
          {tab === "registrar" && saved && (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#E10600] mx-auto" />
              <p className="text-white font-black uppercase tracking-widest">Registrado!</p>
              <p className="text-[#E10600] text-sm">{selected?.cliente}</p>
              {selectedStatusDef?.pipelineStatus && (
                <p className="text-gray-600 text-xs">Pipeline → {selectedStatusDef.pipelineStatus}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-gray-800 uppercase tracking-widest pb-8">
          V4 Company • Performance Arena
        </p>
      </div>
    </div>
  )
}
