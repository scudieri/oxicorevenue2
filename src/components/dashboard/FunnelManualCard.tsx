import { useEffect, useState } from "react"
import { Pencil, Save, X } from "lucide-react"
import { useFunilPeriodo, useUpsertFunilPeriodo } from "@/hooks/useSupabaseData"
import { useAuth } from "@/contexts/AuthContext"
import { usePeriod } from "@/contexts/PeriodContext"

const fmtBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0)

export const FunnelManualCard = () => {
  const { user } = useAuth()
  const { label } = usePeriod()
  const { data: funil }     = useFunilPeriodo()
  const { mutate: upsert, isPending } = useUpsertFunilPeriodo()
  const [edit, setEdit]     = useState(false)
  const [form, setForm]     = useState({
    total_leads: 0, marcados: 0, acontecidos: 0, vendas: 0,
    receita: 0, investimento: 0,
  })

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (funil) setForm({
      total_leads: funil.total_leads ?? 0,
      marcados:    funil.marcados    ?? 0,
      acontecidos: funil.acontecidos ?? 0,
      vendas:      funil.vendas      ?? 0,
      receita:     Number(funil.receita ?? 0),
      investimento: Number(funil.investimento ?? 0),
    })
  }, [funil])

  const save = () => {
    upsert(form, { onSuccess: () => setEdit(false) })
  }

  const totalLeads = funil?.total_leads ?? 0
  const marcados   = funil?.marcados    ?? 0
  const acontecidos = funil?.acontecidos ?? 0
  const vendas     = funil?.vendas      ?? 0
  const receita    = Number(funil?.receita ?? 0)
  const inv        = Number(funil?.investimento ?? 0)

  const cpl = totalLeads > 0 ? inv / totalLeads : 0
  const cpm = marcados   > 0 ? inv / marcados   : 0
  const cpr = acontecidos > 0 ? inv / acontecidos : 0
  const cpv = vendas     > 0 ? inv / vendas     : 0
  const ticket = vendas  > 0 ? receita / vendas : 0
  const roas = inv > 0 ? receita / inv : 0

  const rows = [
    { label: "Total de Leads", value: totalLeads,                           taxa: null,                             custo: cpl, custoLabel: "CPL" },
    { label: "Marcados",       value: marcados,                             taxa: pct(marcados, totalLeads),        custo: cpm, custoLabel: "CPM" },
    { label: "Acontecidos",    value: acontecidos,                          taxa: pct(acontecidos, marcados),       custo: cpr, custoLabel: "CPR" },
    { label: "Vendas",         value: vendas,                               taxa: pct(vendas, acontecidos),         custo: cpv, custoLabel: "CPV" },
  ]

  return (
    <div className="glass-neu p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600">Funil Completo</p>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Todos os Canais <span className="text-[#E10600]">· {label}</span>
          </h3>
        </div>
        {isAdmin && !edit && (
          <button onClick={() => setEdit(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#333] text-gray-400 hover:text-[#E10600] hover:border-[#E10600] text-[10px] tracking-widest uppercase transition-all">
            <Pencil className="w-3 h-3" /> Editar
          </button>
        )}
      </div>

      {!edit ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[9px] uppercase tracking-widest text-gray-600 border-b border-[#222]">
              <th className="text-left py-2">Etapa</th>
              <th className="text-right py-2">Qtd</th>
              <th className="text-right py-2">Conv.</th>
              <th className="text-right py-2">Custo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-b border-[#1A1A1A]">
                <td className="py-2.5 text-white font-bold">{r.label}</td>
                <td className="py-2.5 text-right text-[#E10600] font-mono font-black">{r.value || "—"}</td>
                <td className="py-2.5 text-right text-gray-400 font-mono text-xs">{r.taxa != null ? `${r.taxa.toFixed(1)}%` : "—"}</td>
                <td className="py-2.5 text-right text-gray-300 font-mono text-xs">
                  {r.custo > 0 ? fmtBRL(r.custo) : "—"} <span className="text-gray-700 ml-1">{r.custoLabel}</span>
                </td>
              </tr>
            ))}
            <tr className="border-b border-[#1A1A1A]">
              <td className="py-2.5 text-white font-bold">Receita</td>
              <td className="py-2.5 text-right text-[#E10600] font-mono font-black" colSpan={3}>{fmtBRL(receita)}</td>
            </tr>
            <tr className="border-b border-[#1A1A1A]">
              <td className="py-2.5 text-white font-bold">Ticket Médio</td>
              <td className="py-2.5 text-right text-white font-mono" colSpan={2}>{fmtBRL(ticket)}</td>
              <td className="py-2.5 text-right text-gray-300 font-mono text-xs">{fmtBRL(inv)} <span className="text-gray-700 ml-1">INV</span></td>
            </tr>
            <tr>
              <td className="py-2.5 text-white font-bold">ROAS</td>
              <td className="py-2.5 text-right text-[#E10600] font-mono font-black" colSpan={3}>{roas.toFixed(2)}x</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {([
              ["total_leads",  "Total de Leads"],
              ["marcados",     "Marcados"],
              ["acontecidos",  "Acontecidos"],
              ["vendas",       "Vendas"],
              ["receita",      "Receita (R$)"],
              ["investimento", "Investimento (R$)"],
            ] as const).map(([key, lbl]) => (
              <label key={key} className="block">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{lbl}</span>
                <input
                  type="number"
                  step="0.01"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                  className="w-full mt-1 px-3 py-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-white text-sm font-mono focus:border-[#E10600] outline-none"
                />
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={isPending}
              className="flex items-center gap-1 px-4 py-2 bg-[#E10600] text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-[#b00500] disabled:opacity-30">
              <Save className="w-3 h-3" /> {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setEdit(false)}
              className="flex items-center gap-1 px-4 py-2 border border-[#333] text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs rounded-lg">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
