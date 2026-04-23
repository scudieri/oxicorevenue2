import { useState } from "react"
import { useAddDeal } from "@/hooks/useSupabaseData"
import { PipelineDeal } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

const BLANK: Omit<PipelineDeal, 'id'> = {
  cliente: "", valor: null, status: "Proposta", temperatura: "Quente",
  data_lead: "Abril", canal: "LeadBroker", produto: "ONE TIME",
  closer: "", sdr: "", data_assinatura: null,
}

export const AddDealModal = () => {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(BLANK)
  const { mutate: addDeal, isPending } = useAddDeal()

  const set = (k: keyof typeof BLANK, v: string | number | null) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente) return
    addDeal(form, {
      onSuccess: () => { setOpen(false); setForm(BLANK) },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#C8FF00] text-black hover:bg-[#b0e000] font-black text-xs tracking-widest uppercase">
          <Plus className="w-3 h-3 mr-1" /> Novo Deal
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#1A1A1A] border-[#333] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#C8FF00] font-black tracking-widest uppercase text-sm">
            Adicionar Deal ao Pipeline
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Cliente *</Label>
              <Input value={form.cliente} onChange={e => set('cliente', e.target.value)}
                placeholder="Nome da empresa" required
                className="bg-[#252525] border-[#333] text-white mt-1" />
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Valor (R$)</Label>
              <Input type="number" value={form.valor ?? ""} onChange={e => set('valor', e.target.value ? Number(e.target.value) : null)}
                placeholder="ex: 14900"
                className="bg-[#252525] border-[#333] text-white mt-1" />
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["Proposta","Fechado","Negativou","Stand by"].map(s =>
                    <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Temperatura</Label>
              <Select value={form.temperatura} onValueChange={v => set('temperatura', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["Quente","Morno","Frio"].map(t =>
                    <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Produto</Label>
              <Select value={form.produto} onValueChange={v => set('produto', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["ONE TIME","Ass. Booking"].map(p =>
                    <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Closer</Label>
              <Select value={form.closer} onValueChange={v => set('closer', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["Bruno", "Luís Felipe"].map(c =>
                    <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">SDR</Label>
              <Select value={form.sdr ?? ""} onValueChange={v => set('sdr', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["João Gabriel"].map(s =>
                    <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Canal</Label>
              <Select value={form.canal} onValueChange={v => set('canal', v)}>
                <SelectTrigger className="bg-[#252525] border-[#333] text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333]">
                  {["LeadBroker","Recomendação","OutBound"].map(c =>
                    <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400 uppercase tracking-widest">Data Assinatura</Label>
              <Input type="date" value={form.data_assinatura ?? ""}
                onChange={e => set('data_assinatura', e.target.value || null)}
                className="bg-[#252525] border-[#333] text-white mt-1" />
            </div>
          </div>

          <Button type="submit" disabled={isPending}
            className="w-full bg-[#C8FF00] text-black font-black uppercase tracking-widest hover:bg-[#b0e000]">
            {isPending ? "Salvando..." : "Salvar Deal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
