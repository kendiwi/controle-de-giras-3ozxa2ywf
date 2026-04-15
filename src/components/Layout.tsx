import { Outlet, Link, useLocation } from 'react-router-dom'
import { Users, List as ListIcon, CalendarHeart, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { activeGroup, setActiveGroup } = useActiveGroup()

  const showNav = !['/auth', '/groups', '/'].includes(location.pathname)

  const handleLogout = () => {
    signOut()
    setActiveGroup(null)
  }

  const handleLeaveGroup = () => {
    setActiveGroup(null)
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {showNav && (
        <header className="h-16 flex items-center justify-between px-4 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight truncate max-w-[200px]">
              {activeGroup?.name}
            </h1>
            <span className="text-[10px] text-primary-foreground/80 font-medium tracking-wide">
              CONTROLE DE GIRAS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveGroup}
              className="text-xs bg-primary-foreground/20 px-2 py-1 rounded"
            >
              Trocar
            </button>
            <Avatar
              className="h-8 w-8 cursor-pointer border border-primary-foreground/30"
              onClick={handleLogout}
            >
              <AvatarFallback className="bg-primary-foreground text-primary font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
      )}

      <main className={cn('flex-1 animate-fade-in', showNav ? 'pb-20' : '')}>
        <Outlet />
      </main>

      {showNav && (
        <nav className="fixed bottom-0 w-full h-16 bg-card border-t border-border flex justify-around items-center px-2 z-50 safe-area-bottom">
          <NavItem
            to="/giras"
            icon={CalendarHeart}
            label="Giras"
            active={location.pathname.startsWith('/giras')}
          />
          <NavItem
            to="/mediums"
            icon={Users}
            label="Médiuns"
            active={location.pathname.startsWith('/mediums')}
          />
          <NavItem
            to="/lists"
            icon={ListIcon}
            label="Listas"
            active={location.pathname.startsWith('/lists')}
          />
          <NavItem
            to="/reports"
            icon={BarChart3}
            label="Relatórios"
            active={location.pathname.startsWith('/reports')}
          />
        </nav>
      )}
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string
  icon: any
  label: string
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors duration-200',
        active && 'text-primary',
      )}
    >
      <Icon className={cn('h-6 w-6', active && 'fill-primary/20')} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}
