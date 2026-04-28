import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase, supabaseData } from "@/lib/supabase"

export type Role = "admin" | "closer" | "sdr" | "spectator"

interface AuthUser {
  email: string
  nome: string
  role: Role
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInAdmin: (email: string, password: string) => Promise<string | null>
  enterAsSpectator: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const resolveRole = async (supaUser: User): Promise<AuthUser> => {
    const email = supaUser.email ?? ""
    try {
      const { data } = await supabaseData
        .from("user_roles")
        .select("role, nome")
        .eq("email", email)
        .maybeSingle()
      return {
        email,
        nome:   data?.nome  ?? supaUser.user_metadata?.full_name ?? email.split("@")[0],
        role:   (data?.role as Role) ?? "spectator",
        avatar: supaUser.user_metadata?.avatar_url,
      }
    } catch {
      return {
        email,
        nome:   supaUser.user_metadata?.full_name ?? email.split("@")[0],
        role:   "spectator",
        avatar: supaUser.user_metadata?.avatar_url,
      }
    }
  }

  useEffect(() => {
    const spectator = localStorage.getItem("spectator")
    if (spectator) {
      setUser({ email: "spectator", nome: "Espectador", role: "spectator" })
      setLoading(false)
      return
    }

    // Timeout de segurança — nunca trava mais de 4s
    const timeout = setTimeout(() => setLoading(false), 4000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      setSession(session)
      if (session?.user) setUser(await resolveRole(session.user))
      setLoading(false)
    }).catch(() => { clearTimeout(timeout); setLoading(false) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session)
      if (session?.user) {
        const resolved = await resolveRole(session.user)
        setUser(resolved)
        setLoading(false)
      } else if (!localStorage.getItem("spectator")) {
        setUser(null)
        setLoading(false)
      }
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
        queryParams: { hd: "v4company.com" },
      },
    })
  }

  const signInAdmin = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    if (data.user) {
      const authUser = await resolveRole(data.user)
      setUser(authUser)
      setSession(data.session)
      setLoading(false)
    }
    return null
  }

  const enterAsSpectator = () => {
    localStorage.setItem("spectator", "true")
    setUser({ email: "spectator", nome: "Espectador", role: "spectator" })
  }

  const signOut = async () => {
    localStorage.removeItem("spectator")
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInAdmin, enterAsSpectator, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
