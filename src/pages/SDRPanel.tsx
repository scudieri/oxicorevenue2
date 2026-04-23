import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { usePipeline } from "@/hooks/useSupabaseData"
import { supabaseData as supabase } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { PipelineDeal } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogOut, Search, CheckCircle2, ChevronRight } from "lucide-react"

const SDR_STATUS = [
  { key: "marcada",   label: "Marcada",   color: "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10", dot: "bg-[#00E5FF]" },
  { key: "show",      label: "Show",      color: "border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/10", dot: "bg-[#C8FF00]" },
  { key: "no_show",   label: "No Show",   color: "border-red-400 text-red-400 bg-red-400/10",        dot: "bg-red-500"   },
  { key: "remarcada", label: "Remarcada", color: "border-orange-400 text-orange-400 bg-orange-400/10", dot: "bg-orange-400" },
]

const TEMP_DOT: Record<string, string> = {
  Quente: "bg-red-500", Morno: "bg-orange-400", Frio: "bg-[#00E5FF]"
}

export default function SDRPanel() {
  const { user, signOut }          = useAuth()
  const navigate                   = useNavigate()
  const { data: deals = [] }       = usePipeline()
  const qc                         = useQueryClient()

  const [search, setSearch]         = useState("")
  const [selected, setSelected]     = useState<PipelineDeal | null>(null)
  const [status, setStatus]         = useState("")
  const [obs, setObs]               = useState("")
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  if (!user) { navigate("/login"); return null }
  if (user.role !== "sdr" && user.role !== "admin") {
    navigate("/"); return null
  }

  const filtered = deals.filter(d =>
    d.cliente.toLowerCase().includes(search.toLowerCase()) &&
    d.status !== "Negativou"
  )

  const handleSave = async () => {
    if (!selected || !status) return
    setSaving(true)
    await supabase.from("atividades").insert({
      deal_id: selected.id,
      tipo: "sdr",
      usuario: user.nome,
      status,
      obs,
      data: new Date().toISOString().split("T")[0],
    })
    // Atualiza status do deal se marcada
    if (status === "marcada") {
      await supabase.from("pipeline").update({ status: "Proposta" }).eq("id", selected.id!)
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
              <span className="text-[#C8FF00]">{user.nome}</span>
            </h1>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-gray-600 hover:text-red-400 text-xs uppercase tracking-widest transition-colors">
            <LogOut className="w-3 h-3" /> Sair
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: selecionar lead */}
          {!selected && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#00E5FF] mb-3">
                  Selecionar Lead
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                  <Input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar empresa..."
                    autoFocus
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white pl-8 h-11" />
                </div>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.map(deal => (
                  <motion.button key={deal.id} whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(deal)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3
                               flex items-center justify-between hover:border-[#C8FF00]/40 transition-all text-left">
                    <div>
                      <p className="text-white font-bold text-sm">{deal.cliente}</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {deal.closer ?? "—"} · {deal.canal}
                      </p>
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

          {/* Step 2: registrar status */}
          {selected && !saved && (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[#C8FF00] font-black">{selected.cliente}</p>
                  <p className="text-gray-600 text-xs">{selected.closer} · {selected.canal}</p>
                </div>
                <button onClick={() => { setSelected(null); setStatus("") }}
                  className="text-gray-600 hover:text-white text-xs">✕</button>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
                  O que aconteceu?
                </p>
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
              </div>

              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Observação</p>
                <Input value={obs} onChange={e => setObs(e.target.value)}
                  placeholder="opcional"
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white h-11" />
              </div>

              <Button onClick={handleSave} disabled={!status || saving}
                className="w-full h-12 bg-[#C8FF00] text-black font-black uppercase tracking-widest hover:bg-[#b0e000] disabled:opacity-30">
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </motion.div>
          )}

          {/* Confirmação */}
          {saved && (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#C8FF00] mx-auto" />
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
