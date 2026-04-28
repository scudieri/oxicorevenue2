import { usePeriod, Granularity, MONTHS_PT_EXPORT } from "@/contexts/PeriodContext"
import { Calendar } from "lucide-react"

const GRAN_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "month",   label: "Mês"       },
  { value: "quarter", label: "Trimestre" },
  { value: "year",    label: "Ano"       },
]

export const PeriodSelector = () => {
  const { granularity, year, month, quarter, label, setGranularity, setYear, setMonth, setQuarter } = usePeriod()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const baseSelect = "bg-[#1A1A1A] border border-[#333] text-white text-xs font-bold tracking-widest uppercase px-2 py-1.5 rounded-lg hover:border-[#E10600] cursor-pointer transition-all"

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D0D0D] border border-[#333]">
        <Calendar className="w-3 h-3 text-[#E10600]" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E10600]">{label}</span>
      </div>

      <select value={granularity} onChange={e => setGranularity(e.target.value as Granularity)} className={baseSelect}>
        {GRAN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {granularity === "month" && (
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className={baseSelect}>
          {MONTHS_PT_EXPORT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
      )}

      {granularity === "quarter" && (
        <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} className={baseSelect}>
          {[1, 2, 3, 4].map(q => <option key={q} value={q}>Q{q}</option>)}
        </select>
      )}

      <select value={year} onChange={e => setYear(Number(e.target.value))} className={baseSelect}>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  )
}
