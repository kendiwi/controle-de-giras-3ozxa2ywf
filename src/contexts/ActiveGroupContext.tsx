import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Group = { id: string; name: string }

interface ActiveGroupContextType {
  activeGroup: Group | null
  setActiveGroup: (group: Group | null) => void
}

const ActiveGroupContext = createContext<ActiveGroupContextType | undefined>(undefined)

export const ActiveGroupProvider = ({ children }: { children: ReactNode }) => {
  const [activeGroup, setActiveGroup] = useState<Group | null>(() => {
    const stored = localStorage.getItem('activeGroup')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (activeGroup) localStorage.setItem('activeGroup', JSON.stringify(activeGroup))
    else localStorage.removeItem('activeGroup')
  }, [activeGroup])

  return (
    <ActiveGroupContext.Provider value={{ activeGroup, setActiveGroup }}>
      {children}
    </ActiveGroupContext.Provider>
  )
}

export const useActiveGroup = () => {
  const ctx = useContext(ActiveGroupContext)
  if (!ctx) throw new Error('useActiveGroup must be used within Provider')
  return ctx
}
