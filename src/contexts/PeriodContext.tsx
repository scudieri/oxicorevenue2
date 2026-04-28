import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react"

export type Granularity = "month" | "quarter" | "year"

export interface PeriodValue {
  granularity: Granularity
  year: number
  month: number      // 1-12 (usado quando granularity=month)
  quarter: number    // 1-4 (usado quando granularity=quarter)
  from: string       // YYYY-MM-DD
  to: string         // YYYY-MM-DD
  periodo: string    // "ABR 2026" — string compatível com config_mes
  label: string      // "Abril 2026" / "Q2 2026" / "2026"
  setGranularity: (g: Granularity) => void
  setYear: (y: number) => void
  setMonth: (m: number) => void
  setQuarter: (q: number) => void
}

const PeriodContext = createContext<PeriodValue | null>(null)

const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const MONTHS_ABR = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"]

const pad = (n: number) => String(n).padStart(2, "0")
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate()

const computeRange = (g: Granularity, y: number, m: number, q: number) => {
  if (g === "year") {
    return { from: `${y}-01-01`, to: `${y}-12-31`, label: `${y}` }
  }
  if (g === "quarter") {
    const startM = (q - 1) * 3 + 1
    const endM = startM + 2
    return {
      from: `${y}-${pad(startM)}-01`,
      to:   `${y}-${pad(endM)}-${pad(lastDay(y, endM))}`,
      label: `Q${q} ${y}`,
    }
  }
  return {
    from: `${y}-${pad(m)}-01`,
    to:   `${y}-${pad(m)}-${pad(lastDay(y, m))}`,
    label: `${MONTHS_PT[m - 1]} ${y}`,
  }
}

const STORAGE_KEY = "oxi_period_v1"

export const PeriodProvider = ({ children }: { children: ReactNode }) => {
  const now = new Date()

  const init = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as { granularity: Granularity; year: number; month: number; quarter: number }
    } catch {}
    const m = now.getMonth() + 1
    return {
      granularity: "month" as Granularity,
      year: now.getFullYear(),
      month: m,
      quarter: Math.ceil(m / 3),
    }
  }, [])

  const [granularity, setGranularity] = useState<Granularity>(init.granularity)
  const [year, setYear]               = useState(init.year)
  const [month, setMonth]             = useState(init.month)
  const [quarter, setQuarter]         = useState(init.quarter)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ granularity, year, month, quarter }))
  }, [granularity, year, month, quarter])

  const value = useMemo<PeriodValue>(() => {
    const { from, to, label } = computeRange(granularity, year, month, quarter)
    const periodo = `${MONTHS_ABR[month - 1]} ${year}`
    return {
      granularity, year, month, quarter,
      from, to, periodo, label,
      setGranularity, setYear, setMonth, setQuarter,
    }
  }, [granularity, year, month, quarter])

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

export const usePeriod = () => {
  const ctx = useContext(PeriodContext)
  if (!ctx) throw new Error("usePeriod must be used within PeriodProvider")
  return ctx
}

export const MONTHS_PT_EXPORT = MONTHS_PT
export const MONTHS_ABR_EXPORT = MONTHS_ABR
