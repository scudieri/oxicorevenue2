import { useState, ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, TableProperties, Trophy, UserCheck, Target, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ImportCsvModal } from "@/components/dashboard/ImportCsvModal"
import { AddDealModal } from "@/components/dashboard/AddDealModal"
import v4Logo from "@/assets/v4-logo.jpg"

const NAV = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/pipeline", label: "Pipeline",  icon: TableProperties },
  { to: "/team",     label: "Players",   icon: Trophy          },
  { to: "/sdr",      label: "SDR",       icon: UserCheck       },
  { to: "/closer",   label: "Closer",    icon: Target          },
]

export const Sidebar = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await signOut(); navigate("/login") }
  const initials = user?.nome?.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase() ?? "?"
  const isAdmin = user?.role === "admin"

  const NavLinks = () => (
    <nav className="space-y-1">
      {NAV.map(item => {
        const active = location.pathname === item.to
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              active
                ? "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/40"
                : "text-gray-500 hover:text-white hover:bg-[#1A1A1A] border border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const Body: ReactNode = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[#1A1A1A]">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E10600]/30">
          <img src={v4Logo} alt="V4" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold">Oxicore</p>
          <h1 className="text-sm font-black uppercase tracking-widest text-white">
            Re<span className="text-[#E10600]">venue</span>
          </h1>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="ml-auto md:hidden text-gray-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-700 font-bold px-2 mb-2">Navegação</p>
          <NavLinks />
        </div>

        {isAdmin && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-700 font-bold px-2 mb-2">Ações Rápidas</p>
            <div className="flex flex-col gap-2">
              <ImportCsvModal />
              <AddDealModal />
            </div>
          </div>
        )}
      </div>

      {/* User card + logout */}
      <div className="border-t border-[#1A1A1A] p-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0D0D0D] border border-[#1A1A1A]">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.nome} className="w-10 h-10 rounded-full object-cover border border-[#E10600]/30" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#E10600]/10 border border-[#E10600]/40 flex items-center justify-center">
              <span className="text-xs font-black text-[#E10600]">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white uppercase tracking-wider truncate">{user?.nome ?? "—"}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#333] text-gray-500 hover:text-red-400 hover:border-red-400/40 text-[10px] tracking-widest uppercase transition-all"
        >
          <LogOut className="w-3 h-3" /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-white"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 z-40"
        />
      )}

      {/* Sidebar — fixa no desktop, drawer no mobile */}
      <aside
        className={`fixed md:fixed top-0 left-0 h-screen w-64 bg-[#0A0A0A] border-r border-[#1A1A1A] z-50 transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {Body}
      </aside>
    </>
  )
}
