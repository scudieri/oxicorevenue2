import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import Index       from "./pages/Index"
import Login       from "./pages/Login"
import Pipeline    from "./pages/Pipeline"
import SDRPanel    from "./pages/SDRPanel"
import CloserPanel from "./pages/CloserPanel"
import NotFound    from "./pages/NotFound"

const queryClient = new QueryClient()

// Guard: redireciona para /login se não autenticado
const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <p className="text-gray-600 text-xs uppercase tracking-widest animate-pulse">Carregando...</p>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Index /></Protected>} />
            <Route path="/pipeline" element={<Protected><Pipeline /></Protected>} />
            <Route path="/sdr" element={<Protected><SDRPanel /></Protected>} />
            <Route path="/closer" element={<Protected><CloserPanel /></Protected>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
