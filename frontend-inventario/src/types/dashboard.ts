// src/types/dashboard.ts
export type DashboardView = 'main' | 'inventory' | 'orders' | 'shipments'

// src/context/DashboardContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DashboardView } from '../types/dashboard'

interface DashboardContextType {
  currentView: DashboardView
  setCurrentView: (view: DashboardView) => void
  previousView: DashboardView | null
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('main')
  const [previousView, setPreviousView] = useState<DashboardView | null>(null)

  const changeView = (view: DashboardView) => {
    setPreviousView(currentView)
    setCurrentView(view)
  }

  return (
    <DashboardContext.Provider value={{ 
      currentView, 
      setCurrentView: changeView, 
      previousView 
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}