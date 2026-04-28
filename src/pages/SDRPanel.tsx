import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { usePipeline, useSdrDiario } from "@/hooks/useSupabaseData"
import { supabaseData } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { PipelineDeal } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut, Search, CheckCircle2, ChevronRight, BarChart2, ClipboardList } from "lucide-react"

const SDR_STATUS = [
  { key: "marcada",   label: "Marcada",   color: "border-gray-500 text-gray-300 bg-gray-400/10", dot: "bg-gray-400" },
  { key: "show",      label: "Show",      color: "border-[#E10600] text-[#E10600] bg-[#E10600]/10", dot: "bg-[#E10600]" },
  { key: "no_show",   label: "No Show",   color: "border-red-400 text-red-400 bg-red-400/10",        dot: "bg-red-500"   },
  { key: "remarcada", label: "Remarcada", color: "border-[#E10600] text-[#E10600] bg-[#E10600]/10", dot: "bg-gray-400" },
]

const TEMP_DOT: Record<string, string> = {
  Quente: "bg-red-500", Morno: "bg-gray-400", Frio: "bg-gray-400"
}

const DAY_NAMES: Record<string, string> = {
  "2026-04-01": "Qua 01", "2026-04-02": "Qui 02", "2026-04-03": "Sex 03",
  "2026-04-06": "Seg 06", "2026-04-07": "Ter 07", "2026-04-08": "Qua 08",
  "2026-04-09": "Qui 09", "2026-04-10": "Sex 10", "2026-04-13": "Seg 13",
  "2026-04-14": "Ter 14", "2026-04-15": "Qua 15", "2026-04-16": "Qui 16",
  "2026-04-17": "Sex 17", "2026-04-20": "Seg 20", "2026-04-21": "Ter 21",
  "2026-04-22": "Qua 22", "2026-04-23": "Qui 23", "2026-04-24": "Sex 24",
  "2026-04-27": "Seg 27", "2026-04-28": "Ter 28", "2026-04-29": "Qua 29",
  "2026-04-30": "Qui 30",
}

export default function SDRPanel() {
  const { user, signOut }          = useAuth()
  const navigate                   = useNavigate()
  const { data: deals = [] }       = usePipeline()
  const { data: sdrData = [] }     = useSdrDiario()
  const qc                         = useQueryClient()

  const [tab, setTab]               = useState<"registrar" | "stats">("registrar")
  const [search, setSearch]         = useState("")
  const [selected, setSelected]     = useState<PipelineDeal | null>(null)
  const [status, setStatus]         = useState("")
  const [obs, setObs]               = useState("")
  const [date, setDate]             = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  if (!user) { navigate("/login"); return null }
  if (user.role !== "sdr" && user.role !== "admin") { navigate("/"); return null }

  const filtered = deals.filter(d =>
    d.cliente.toLowerCase().includes(search.toLowerCase()) &&
    d.status !== "Negativou"
  )

  // Stats
  const totalShow     = sdrData.reduce((s, d) => s + (d.show     ?? 0), 0)
  const totalNoShow   = sdrData.reduce((s, d) => s + (d.no_show  ?? 0), 0)
  const totalMarcadas = sdrData.reduce((s, d) => s + (d.marcadas ?? 0), 0)
  const totalRemar    = sdrData.reduce((s, d) => s + (d.remarcada ?? 0), 0)
  const showRate      = (totalShow + totalNoShow) > 0 ? Math.round((totalShow / (totalShow + totalNoShow)) * 100) : 0

  const handleSave = async () => {
    if (!selected || !status) return
    setSaving(true)
    await supabaseData.from("atividades").insert({
      deal_id: selected.id, tipo: "sdr", usuario: user.nome,
      status, obs, data: date,
    })
    if (status === "marcada") {
      await supabaseData.from("pipeline").update({ status: "Proposta" }).eq("id", selected.id!)
    }
    qc.invalidateQueries({ queryKey: ["pipeline"] })
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); setSelected(null); setStatus(""); setObs(""); setSearch("") }, 2000)
  }

  const handleLogout = async () => { await signOut(); navigate("/login") }

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">SDR</p>
            <h1 className="text-xl font-black text-white uppercase tracking-widest">
              <span className="text-gray-300">{user.nome}</span>
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
            { key: "registrar", label: "Registrar", icon: ClipboardList },
            { key: "stats",     label: "Meus Números", icon: BarChart2 },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                ${tab === key
                  ? "bg-gray-400/10 border border-gray-500 text-gray-300"
                  : "border border-[#2A2A2A] text-gray-600 hover:text-white"}`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STATS ── */}
          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6">

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Shows",      value: totalShow,     color: "text-[#E10600]" },
                  { label: "No Shows",   value: totalNoShow,   color: "text-red-400"   },
                  { label: "Marcadas",   value: totalMarcadas, color: "text-gray-300" },
                  { label: "Remarcadas", value: totalRemar,    color: "text-[#E10600]"},
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Show Rate</p>
                <p className="text-2xl font-black text-[#E10600]">{showRate}%</p>
              </div>

              {/* Tabela por dia */}
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 text-[10px] uppercase tracking-widest text-gray-600 font-black px-3 py-2 border-b border-[#2A2A2A]">
                  <span>Dia</span>
                  <span className="text-center text-[#E10600]">Show</span>
                  <span className="text-center text-red-400">N.Show</span>
                  <span className="text-center text-gray-300">Marc.</span>
                  <span className="text-center text-[#E10600]">Rem.</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {sdrData.map((d) => (
                    <div key={d.data} className="grid grid-cols-5 text-xs px-3 py-2 border-b border-[#1E1E1E] hover:bg-[#222]">
                      <span className="text-gray-500">{DAY_NAMES[d.data] ?? d.data}</span>
                      <span className="text-center text-[#E10600] font-bold">{d.show ?? 0}</span>
                      <span className="text-center text-red-400 font-bold">{d.no_show ?? 0}</span>
                      <span className="text-center text-gray-300 font-bold">{d.marcadas ?? 0}</span>
                      <span className="text-center text-[#E10600] font-bold">{d.remarcada ?? 0}</span>
                    </div>
                  ))}
                  {sdrData.length === 0 && (
                    <p className="text-center text-gray-700 py-8 text-sm">Sem dados ainda</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REGISTRAR ── */}
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
                {filtered.map(deal => (
                  <motion.button key={deal.id} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(deal)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3
                               flex items-center justify-between hover:border-gray-500/40 transition-all text-left">
                    <div>
                      <p className="text-white font-bold text-sm">{deal.cliente}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{deal.closer ?? "—"} · {deal.canal}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${TEMP_DOT[deal.temperatura ?? ""] ?? "bg-gray-600"}`} />
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-gray-700 py-8 text-sm">Nenhum lead encontrado</p>
                )}
              </div>
            </motion.div>
          )}

          {tab === "registrar" && selected && !saved && (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-300 font-black">{selected.cliente}</p>
                  <p className="text-gray-600 text-xs">{selected.closer} · {selected.canal}</p>
                </div>
                <button onClick={() => { setSelected(null); setStatus("") }}
                  className="text-gray-600 hover:text-white text-xs">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SDR_STATUS.map(s => (
                  <motion.button key={s.key} whileTap={{ scale: 0.97 }}
                    onClick={() => setStatus(s.key)}
                    className={`py-4 rounded-xl border-2 font-black text-sm uppercase tracking-widest transition-all
                      ${status === s.key ? s.color : "border-[#2A2A2A] text-gray-600 bg-transparent"}`}>
                    <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-2 ${status === s.key ? s.dot : "bg-[#333]"}`} />
                    {s.label}
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
                className="w-full h-12 bg-gray-400 text-black font-black uppercase tracking-widest hover:bg-gray-300 disabled:opacity-30">
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </motion.div>
          )}

          {tab === "registrar" && saved && (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-white font-black uppercase tracking-widest">Registrado!</p>
              <p className="text-gray-600 text-xs">{selected?.cliente}</p>
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
