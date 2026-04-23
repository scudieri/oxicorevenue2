import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePipeline } from "@/hooks/useSupabaseData"
import { supabaseData } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClipboardList, Search, CheckCircle2, ChevronRight } from "lucide-react"
import { PipelineDeal } from "@/lib/supabase"

const SDR_STATUS = [
  { key: "marcada",   label: "Marcada",   color: "border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10", dot: "bg-[#00E5FF]" },
  { key: "show",      label: "Show",      color: "border-[#C8FF00] text-[#C8FF00] bg-[#C8FF00]/10", dot: "bg-[#C8FF00]" },
  { key: "no_show",   label: "No Show",   color: "border-red-400 text-red-400 bg-red-400/10",        dot: "bg-red-500"   },
  { key: "remarcada", label: "Remarcada", color: "border-orange-400 text-orange-400 bg-orange-400/10", dot: "bg-orange-400" },
]

const TEMP_DOT: Record<string, string> = {
  Quente: "bg-red-500", Morno: "bg-orange-400", Frio: "bg-[#00E5FF]"
}

export const AddSdrModal = () => {
  const [open, setOpen]         = useState(false)
  const [search, setSearch]     = useState("")
  const [selected, setSelected] = useState<PipelineDeal | null>(null)
  const [status, setStatus]     = useState("")
  const [obs, setObs]           = useState("")
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const { data: deals = [] }    = usePipeline()
  const qc                      = useQueryClient()

  const filtered = deals.filter(d =>
    d.cliente.toLowerCase().includes(search.toLowerCase()) &&
    d.status !== "Negativou"
  )

  const reset = () => {
    setSelected(null); setStatus(""); setObs(""); setSearch(""); setSaved(false)
    setDate(new Date().toISOString().split("T")[0])
  }

  const handleClose = (v: boolean) => { setOpen(v); if (!v) reset() }

  const handleSave = async () => {
    if (!selected || !status) return
    setSaving(true)
    await supabaseData.from("atividades").insert({
      deal_id: selected.id,
      tipo: "sdr",
      usuario: "admin",
      status,
      obs,
      data: date,
    })
    if (status === "marcada") {
      await supabaseData.from("pipeline").update({ status: "Proposta" }).eq("id", selected.id!)
    }
    qc.invalidateQueries({ queryKey: ["pipeline"] })
    setSaving(false); setSaved(true)
    setTimeout(() => { handleClose(false) }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"
          className="border-[#333] text-gray-400 hover:text-white hover:border-[#00E5FF] text-xs tracking-widest uppercase">
          <ClipboardList className="w-3 h-3 mr-1" /> SDR
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#00E5FF] font-black tracking-widest uppercase text-sm">
            Registrar SDR
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selected && !saved && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-3 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar lead..." autoFocus
                  className="bg-[#252525] border-[#333] text-white pl-8 h-10" />
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filtered.map(deal => (
                  <button key={deal.id} onClick={() => setSelected(deal)}
                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-3 py-2.5
                               flex items-center justify-between hover:border-[#00E5FF]/40 transition-all text-left">
                    <div>
                      <p className="text-white font-bold text-sm">{deal.cliente}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{deal.closer ?? "—"} · {deal.canal}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${TEMP_DOT[deal.temperatura ?? ""] ?? "bg-gray-600"}`} />
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-gray-700 py-6 text-sm">Nenhum lead encontrado</p>
                )}
              </div>
            </motion.div>
          )}

          {selected && !saved && (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="space-y-4 mt-2">
              <div className="bg-[#252525] border border-[#333] rounded-xl px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[#00E5FF] font-black text-sm">{selected.cliente}</p>
                  <p className="text-gray-600 text-xs">{selected.closer} · {selected.canal}</p>
                </div>
                <button onClick={() => { setSelected(null); setStatus("") }}
                  className="text-gray-600 hover:text-white text-xs">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SDR_STATUS.map(s => (
                  <button key={s.key} onClick={() => setStatus(s.key)}
                    className={`py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all
                      ${status === s.key ? s.color : "border-[#333] text-gray-600 bg-transparent"}`}>
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${status === s.key ? s.dot : "bg-[#444]"}`} />
                    {s.label}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Data</p>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="bg-[#252525] border-[#333] text-white h-10" />
              </div>

              <Input value={obs} onChange={e => setObs(e.target.value)}
                placeholder="Observação (opcional)"
                className="bg-[#252525] border-[#333] text-white h-10" />

              <Button onClick={handleSave} disabled={!status || saving}
                className="w-full bg-[#00E5FF] text-black font-black uppercase tracking-widest hover:bg-[#00c8e0] disabled:opacity-30">
                {saving ? "Salvando..." : "Registrar"}
              </Button>
            </motion.div>
          )}

          {saved && (
            <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#00E5FF] mx-auto" />
              <p className="text-white font-black uppercase tracking-widest text-sm">Registrado!</p>
              <p className="text-gray-500 text-xs">{selected?.cliente}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
