import type { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-4 bg-white shadow">Dashboard Header</header>
      <main className="p-4">{children}</main>
    </div>
  )
}
