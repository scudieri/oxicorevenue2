import { useState } from "react"
import { motion } from "framer-motion"
import { usePipeline } from "@/hooks/useSupabaseData"
import { AddDealModal } from "@/components/dashboard/AddDealModal"
import { useUpdateDeal } from "@/hooks/useSupabaseData"
import { PipelineDeal } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { ArrowLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const STATUS_STYLE: Record<string, string> = {
  Fechado:   "bg-[#1A3320] text-[#C8FF00] border-[#2A5A30]",
  Proposta:  "bg-[#2A2010] text-orange-400 border-[#4A3A20]",
  Negativou: "bg-[#3A1A1A] text-red-400 border-[#5A2A2A]",
  "Stand by":"bg-[#0D1A2A] text-[#00E5FF] border-[#1A3A5A]",
}
const TEMP_DOT: Record<string, string> = {
  Quente: "bg-red-500", Morno: "bg-orange-400", Frio: "bg-[#00E5FF]"
}

const fmt = (v: number | null) =>
  v == null ? "—" :
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

const STATUS_ORDER = ["Fechado","Proposta","Stand by","Negativou"]

export default function Pipeline() {
  const { data: deals = [], isLoading } = usePipeline()
  const { mutate: updateDeal }         = useUpdateDeal()
  const [search, setSearch]            = useState("")
  const [filterStatus, setFilterStatus]= useState<string>("Todos")

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

  const changeStatus = (deal: PipelineDeal, newStatus: PipelineDeal["status"]) => {
    if (!deal.id) return
    updateDeal({ id: deal.id, status: newStatus })
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
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">ABR 2026</p>
              <h1 className="text-xl font-black text-white uppercase tracking-widest">
                Pipeline <span className="text-[#C8FF00]">de Leads</span>
              </h1>
            </div>
          </div>
          <AddDealModal />
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Receita Fechada",  value: fmt(totals.fechado),  color: "text-[#C8FF00]" },
            { label: "Pipeline Aberto",  value: fmt(totals.pipeline), color: "text-orange-400" },
            { label: "Deals Fechados",   value: String(totals.deals), color: "text-white"      },
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
                    ? "bg-[#C8FF00] text-black border-[#C8FF00]"
                    : "bg-[#1A1A1A] text-gray-500 border-[#2A2A2A] hover:border-[#444]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

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
                  <motion.tr
                    key={deal.id ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-bold whitespace-nowrap">{deal.cliente}</td>
                    <td className="px-4 py-3 text-[#C8FF00] font-bold whitespace-nowrap">{fmt(deal.valor)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={deal.status}
                        onChange={e => changeStatus(deal, e.target.value as PipelineDeal["status"])}
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border cursor-pointer bg-transparent ${STATUS_STYLE[deal.status]}`}
                      >
                        {STATUS_ORDER.map(s => <option key={s} value={s} className="bg-[#1A1A1A] text-white">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${TEMP_DOT[deal.temperatura ?? ""] ?? "bg-gray-600"}`} />
                        <span className="text-gray-400">{deal.temperatura}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#00E5FF] whitespace-nowrap">{deal.produto}</td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">{deal.closer ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{deal.sdr ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{deal.canal ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {deal.data_assinatura
                        ? new Date(deal.data_assinatura + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
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
