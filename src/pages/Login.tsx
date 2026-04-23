import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"

export default function Login() {
  const { signInWithGoogle, signInAdmin, enterAsSpectator, user } = useAuth()
  const navigate = useNavigate()

  const [showAdmin, setShowAdmin] = useState(false)
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (user) navigate("/", { replace: true })
  }, [user])

  const handleGoogle = async () => {
    setLoading(true)
    await signInWithGoogle()
  }

  const handleAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    const err = await signInAdmin(email, password)
    if (err) { setError("Email ou senha incorretos."); setLoading(false) }
  }

  const handleSpectator = () => {
    enterAsSpectator()
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Marca */}
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gray-600">V4 Company</p>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest leading-none">
            Performance<br /><span className="text-[#C8FF00]">Arena</span>
          </h1>
          <p className="text-xs text-gray-600">ABR 2026 — Oxicore</p>
        </div>

        <div className="space-y-3">
          {/* Google Login */}
          {!showAdmin && (
            <>
              <Button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-12 bg-white text-black font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 12.8 4.5 3.5 13.8 3.5 25S12.8 45.5 24 45.5c11 0 20-8 20-20.5 0-1-.1-2-.4-3z"/>
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                  <path fill="#4CAF50" d="M24 45.5c5 0 9.5-1.9 12.9-4.9l-6-5.1C29.1 37.3 26.7 38 24 38c-5.3 0-9.7-3.6-11.3-8.5l-6.6 5.1C9.7 41.1 16.4 45.5 24 45.5z"/>
                  <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.5-4.9 5.9l6 5.1C40.5 35.5 44 30.7 44 25c0-1-.1-2-.4-3z"/>
                </svg>
                Entrar com Google (@v4company.com)
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-[#2A2A2A]" />
                <span className="text-[10px] text-gray-700 uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px bg-[#2A2A2A]" />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowAdmin(true)}
                className="w-full h-10 border-[#2A2A2A] text-gray-500 hover:text-white hover:border-[#444] text-xs uppercase tracking-widest"
              >
                Entrar como Admin
              </Button>

              <button
                onClick={handleSpectator}
                className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-gray-400 text-xs uppercase tracking-widest transition-colors py-2"
              >
                <Eye className="w-3 h-3" /> Entrar como Espectador
              </button>
            </>
          )}

          {/* Admin form */}
          {showAdmin && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAdmin}
              className="space-y-3"
            >
              <button
                type="button"
                onClick={() => { setShowAdmin(false); setError("") }}
                className="text-gray-600 hover:text-white text-xs uppercase tracking-widest transition-colors"
              >
                ← Voltar
              </button>

              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="bg-[#1A1A1A] border-[#333] text-white h-11"
              />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="bg-[#1A1A1A] border-[#333] text-white h-11"
              />

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#C8FF00] text-black font-black uppercase tracking-widest hover:bg-[#b0e000]"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </motion.form>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-800 uppercase tracking-widest">
          Apenas usuários @v4company.com
        </p>
      </motion.div>
    </div>
  )
}
