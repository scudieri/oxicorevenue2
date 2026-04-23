import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth, SdrUser } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SDRS: SdrUser[] = ["Daniel", "João Gabriel"]

export default function SDRLogin() {
  const [selected, setSelected] = useState<SdrUser | null>(null)
  const [pin, setPin]           = useState("")
  const [error, setError]       = useState("")
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const ok = login(selected, pin)
    if (ok) navigate("/sdr/panel")
    else { setError("PIN incorreto. Tente novamente."); setPin("") }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo / título */}
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">V4 Company</p>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            SDR <span className="text-[#C8FF00]">Arena</span>
          </h1>
          <p className="text-xs text-gray-500">Acesse para lançar seus resultados</p>
        </div>

        {/* Seleção de SDR */}
        {!selected ? (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest text-center">Quem é você?</p>
            {SDRS.map(name => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(name)}
                className="w-full py-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A]
                           text-white font-bold text-sm tracking-widest uppercase
                           hover:border-[#C8FF00] hover:text-[#C8FF00] transition-all"
              >
                {name}
              </motion.button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setSelected(null); setPin(""); setError("") }}
                className="text-gray-600 hover:text-white transition-colors text-xs">← Voltar</button>
              <p className="text-[#C8FF00] font-black uppercase tracking-widest text-sm">{selected}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">PIN de acesso</p>
              <Input
                type="password"
                value={pin}
                onChange={e => { setPin(e.target.value); setError("") }}
                placeholder="••••••••"
                autoFocus
                className="bg-[#1A1A1A] border-[#333] text-white text-center tracking-[0.3em] text-lg h-12"
              />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </div>

            <Button type="submit" className="w-full h-12 bg-[#C8FF00] text-black font-black uppercase tracking-widest hover:bg-[#b0e000]">
              Entrar
            </Button>
          </form>
        )}

        <p className="text-center text-[10px] text-gray-700 uppercase tracking-widest">
          Performance Arena • ABR 2026
        </p>
      </motion.div>
    </div>
  )
}
