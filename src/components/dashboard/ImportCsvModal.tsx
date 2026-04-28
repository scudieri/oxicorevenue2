import { useState, useRef } from "react"
import { supabaseData } from "@/lib/supabase"
import { usePeriod } from "@/contexts/PeriodContext"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react"

// Mapeia cabeçalhos do CSV para campos da tabela pipeline
const mapRow = (row: Record<string, string>, periodo: string) => {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const found = Object.entries(row).find(([h]) =>
        h.toLowerCase().includes(k.toLowerCase())
      )
      if (found?.[1]) return found[1].trim()
    }
    return ""
  }

  const rawValor = get("valor", "faturamento", "value")
    .replace(/[R$\s.]/g, "").replace(",", ".")
  const valor = parseFloat(rawValor) || null

  const rawData = get("data de criação", "data_lead", "data de aquisição", "data")
  const data_lead = rawData ? parseDataBR(rawData) : new Date().toISOString().split("T")[0]

  const canal = normalizeCanal(get("canal", "segmento", "origem"))
  const produto = normalizeProduto(get("tipo de produto", "produto", "nome do produto"))
  const status = "Lead" as const

  return {
    cliente:        get("nome da empresa", "empresa", "cliente", "company"),
    valor,
    status,
    temperatura:    "Frio" as const,
    data_lead,
    canal,
    produto,
    closer:         get("arreematador", "closer", "responsável", "nome do responsável"),
    sdr:            get("sdr"),
    data_assinatura: null,
    periodo,
  }
}

const parseDataBR = (s: string) => {
  // Tenta DD/MM/YYYY ou YYYY-MM-DD
  const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`
  const isoMatch = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (isoMatch) return isoMatch[1]
  return new Date().toISOString().split("T")[0]
}

const normalizeCanal = (v: string): string => {
  const l = v.toLowerCase()
  if (l.includes("lead") || l.includes("broker")) return "LeadBroker"
  if (l.includes("recom") || l.includes("indica")) return "Recomendação"
  if (l.includes("out") || l.includes("ativo")) return "OutBound"
  return v || "LeadBroker"
}

const normalizeProduto = (v: string): "ONE TIME" | "Ass. Booking" => {
  const l = v.toLowerCase()
  if (l.includes("ass") || l.includes("recor") || l.includes("booking") || l.includes("mrr")) return "Ass. Booking"
  return "ONE TIME"
}

const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  // Detecta separador
  const sep = lines[0].includes(";") ? ";" : ","

  const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, "").trim())
  return lines.slice(1).map(line => {
    const vals = splitCsvLine(line, sep)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, "").trim() })
    return obj
  }).filter(r => Object.values(r).some(v => v))
}

const splitCsvLine = (line: string, sep: string) => {
  const result: string[] = []
  let cur = "", inQ = false
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ }
    else if (ch === sep && !inQ) { result.push(cur); cur = "" }
    else cur += ch
  }
  result.push(cur)
  return result
}

export const ImportCsvModal = () => {
  const [open, setOpen]       = useState(false)
  const [rows, setRows]       = useState<ReturnType<typeof mapRow>[]>([])
  const [fileName, setFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState("")
  const fileRef               = useRef<HTMLInputElement>(null)
  const qc                    = useQueryClient()
  const { periodo }           = usePeriod()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError("")
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = parseCsv(ev.target?.result as string)
        const mapped = parsed.map(r => mapRow(r, periodo)).filter(r => r.cliente)
        if (mapped.length === 0) { setError("Nenhum lead encontrado. Verifique se o CSV tem coluna 'Nome da empresa' ou 'Cliente'."); return }
        setRows(mapped)
      } catch { setError("Erro ao ler o arquivo.") }
    }
    reader.readAsText(file, "UTF-8")
  }

  const handleImport = async () => {
    if (!rows.length) return
    setImporting(true)

    const { data: existing } = await supabaseData
      .from("pipeline").select("id, cliente").eq("periodo", periodo)

    const existingMap: Record<string, number> = {}
    for (const d of existing ?? []) {
      existingMap[d.cliente.toLowerCase().trim()] = d.id
    }

    const toInsert = rows.filter(r => !existingMap[r.cliente.toLowerCase().trim()])

    if (toInsert.length) {
      const { error: err } = await supabaseData.from("pipeline").insert(toInsert)
      if (err) { setError(err.message); setImporting(false); return }
    }

    qc.invalidateQueries({ queryKey: ["pipeline"] })
    setImporting(false); setDone(true)
    setTimeout(() => { setOpen(false); setRows([]); setFileName(""); setDone(false) }, 2500)
  }

  const handleClose = (v: boolean) => {
    setOpen(v)
    if (!v) { setRows([]); setFileName(""); setDone(false); setError("") }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"
          className="w-full justify-start border-[#333] text-gray-400 hover:text-white hover:border-[#E10600] text-xs tracking-widest uppercase">
          <Upload className="w-3 h-3 mr-1" /> Importar CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0F0F0F] border-[#222] text-white max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-[#1A1A1A]">
          <DialogTitle className="text-white font-black tracking-widest uppercase text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#E10600]" />
            Importar Leads
          </DialogTitle>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">CSV — Aquisições do Broker</p>
        </DialogHeader>

        {!done ? (
          <div className="px-6 py-5 space-y-4">
            {/* Drop zone */}
            {!fileName ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-[#2A2A2A] rounded-xl py-10 flex flex-col items-center gap-3
                           hover:border-[#E10600]/60 hover:bg-[#E10600]/[0.03] transition-all text-center group">
                <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#E10600]/40 transition-all">
                  <FileSpreadsheet className="w-5 h-5 text-gray-500 group-hover:text-[#E10600] transition-colors" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Selecionar arquivo CSV</p>
                  <p className="text-gray-600 text-[11px] mt-1">Arrasta ou clica · vírgula ou ponto-e-vírgula</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                <div className="w-10 h-10 rounded-lg bg-[#E10600]/10 border border-[#E10600]/30 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-[#E10600]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{fileName}</p>
                  <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-0.5">{rows.length} leads detectados</p>
                </div>
                <button onClick={() => { setFileName(""); setRows([]); fileRef.current && (fileRef.current.value = "") }}
                  className="text-gray-600 hover:text-red-400 transition-colors">
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {rows.length > 0 && (
              <div className="rounded-xl border border-[#1F1F1F] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold">Preview</span>
                  <span className="text-[10px] text-[#E10600] font-black uppercase tracking-widest">
                    {rows.length} leads
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                  {rows.map((r, i) => (
                    <div key={i}
                      className="flex items-center justify-between gap-3 px-4 py-2 text-xs border-b border-[#1A1A1A] last:border-0 hover:bg-[#141414] transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-gray-700 font-mono text-[10px] w-5 text-right">{i + 1}</span>
                        <span className="text-white font-bold truncate">{r.cliente}</span>
                      </div>
                      <span className="text-gray-300 font-mono text-[11px] flex-shrink-0">
                        {r.valor != null
                          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(r.valor)
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] text-gray-600 space-y-1 px-1">
              <p className="flex items-start gap-1.5">
                <span className="text-gray-700">·</span>
                <span>Colunas: <span className="text-gray-400">Nome da empresa · Valor · Canal · Tipo de produto · Arreematador · Data de criação</span></span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-gray-700">·</span>
                <span>Novos leads entram com status <span className="text-[#E10600] font-bold">Lead</span> · Existentes são ignorados</span>
              </p>
            </div>

            <Button onClick={handleImport} disabled={!rows.length || importing}
              className="w-full h-11 bg-[#E10600] text-white font-black uppercase tracking-widest hover:bg-[#b00500] disabled:opacity-30 disabled:bg-[#2A2A2A] disabled:text-gray-600">
              {importing ? "Importando..." : rows.length > 0 ? `Importar ${rows.length} leads` : "Selecione um arquivo"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 px-6 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#E10600]/10 border border-[#E10600]/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#E10600]" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm">Importação Concluída</p>
            <p className="text-gray-500 text-xs">{rows.length} leads adicionados ao pipeline</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
