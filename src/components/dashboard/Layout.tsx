import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-[#0D0D0D]">
    <Sidebar />
    <main className="md:pl-64 min-h-screen">
      {children}
    </main>
  </div>
)
